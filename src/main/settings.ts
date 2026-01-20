import { app, BrowserWindow, session } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { Settings, defaultSettings, settingsSchema, clamp } from '../shared/settings';
import { ensureDemergi, stopDpiProcess } from './dpiManager';

const deepMerge = <T extends object>(target: T, source: Partial<T>): T => {
  const output = { ...(target as any) } as any;
  Object.entries(source || {}).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      output[key] = deepMerge((target as any)[key] ?? {}, value as any);
    } else if (value !== undefined) {
      output[key] = value;
    }
  });
  return output as T;
};

type NormalizedSettings = Settings & {
  window: NonNullable<Settings['window']>;
  ua: NonNullable<Settings['ua']>;
  dpi: NonNullable<Settings['dpi']>;
  adblock: NonNullable<Settings['adblock']>;
  ui: NonNullable<Settings['ui']>;
  fab: NonNullable<Settings['fab']>;
};

const normalizeSettings = (raw?: Settings | null): NormalizedSettings => {
  const base = raw ?? defaultSettings;
  const merged = deepMerge(defaultSettings, base);
  
  // Migration: if buttonOrder has 5 items, add 'refresh' after 'forward'
  if (merged.fab?.buttonOrder && merged.fab.buttonOrder.length === 5 && !merged.fab.buttonOrder.includes('refresh')) {
    const order = [...merged.fab.buttonOrder];
    const forwardIdx = order.indexOf('forward');
    if (forwardIdx !== -1) {
      order.splice(forwardIdx + 1, 0, 'refresh');
      merged.fab.buttonOrder = order as any;
    }
  }
  
  return {
    ...merged,
    window: { ...defaultSettings.window, ...(merged.window ?? {}) } as NormalizedSettings['window'],
    ua: { ...defaultSettings.ua, ...(merged.ua ?? {}) } as NormalizedSettings['ua'],
    dpi: { ...defaultSettings.dpi, ...(merged.dpi ?? {}) } as NormalizedSettings['dpi'],
    adblock: { ...defaultSettings.adblock, ...(merged.adblock ?? {}) } as NormalizedSettings['adblock'],
    ui: { ...defaultSettings.ui, ...(merged.ui ?? {}) } as NormalizedSettings['ui'],
    fab: { ...defaultSettings.fab, ...(merged.fab ?? {}) } as NormalizedSettings['fab']
  };
};

const settingsFile = path.join(app.getPath('userData'), 'orion-settings.json');
let cache: NormalizedSettings | null = null;

const readFromDisk = (): NormalizedSettings => {
  try {
    if (fs.existsSync(settingsFile)) {
      const raw = fs.readFileSync(settingsFile, 'utf-8');
      const parsed = JSON.parse(raw);
      const merged = deepMerge(defaultSettings, parsed ?? {});
      
      // Migration: ensure buttonOrder has refresh button
      if (merged.fab?.buttonOrder && merged.fab.buttonOrder.length === 5) {
        const order = [...merged.fab.buttonOrder];
        const forwardIdx = order.indexOf('forward');
        if (forwardIdx !== -1 && !order.includes('refresh')) {
          order.splice(forwardIdx + 1, 0, 'refresh');
          merged.fab.buttonOrder = order as any;
        }
      }
      
      return normalizeSettings(settingsSchema.parse(merged));
    }
  } catch (err) {
    console.warn('[settings] Failed to read/parse settings, using defaults');
  }
  return normalizeSettings(defaultSettings);
};

const writeToDisk = (settings: NormalizedSettings) => {
  try {
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist settings', err);
  }
};

const applyDpiBypass = async (dpi: NormalizedSettings['dpi']) => {
  const ytSession = session.fromPartition(WEBVIEW_PARTITION);

  console.log('[settings] applyDpiBypass called, mode:', dpi.mode, 'autoStart:', dpi.autoStart);

  if (!dpi || dpi.mode === 'off') {
    await stopDpiProcess().catch(() => {});
    // For app-level proxy, we can't unset it once set - needs app restart
    await session.defaultSession.setProxy({ mode: 'direct' }).catch(() => {});
    await ytSession.setProxy({ mode: 'direct' }).catch(() => {});
    console.log('[settings] DPI bypass disabled');
    return;
  }

  if (dpi.mode === 'demergi') {
    const ok = await ensureDemergi(dpi);
    console.log('[settings] ensureDemergi result:', ok);
    if (!ok) {
      await session.defaultSession.setProxy({ mode: 'direct' }).catch(() => {});
      await ytSession.setProxy({ mode: 'direct' }).catch(() => {});
      return;
    }
    
    // Apply at app level too for consistency
    app.commandLine.appendSwitch('proxy-server', `http://127.0.0.1:${dpi.port}`);
    if (dpi.bypass) {
      app.commandLine.appendSwitch('proxy-bypass-list', dpi.bypass);
    }
    console.log('[settings] Applied app-level proxy:', `http://127.0.0.1:${dpi.port}`, 'bypass:', dpi.bypass || 'none');
  }

  // Also apply at session level for compatibility
  const proxyRules = `http://127.0.0.1:${dpi.port}`;
  const proxyBypassRules = dpi.bypass || '';

  console.log('[settings] Setting proxy at session level:', proxyRules, 'bypass:', proxyBypassRules);

  await session.defaultSession
    .setProxy({ proxyRules, proxyBypassRules })
    .catch(() => {});
  await ytSession
    .setProxy({ proxyRules, proxyBypassRules })
    .catch(() => {});
  
  console.log('[settings] Proxy applied to sessions');
};

const WEBVIEW_PARTITION = 'persist:orion-youtube';
const UA_DESKTOP =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const UA_ANDROID =
  'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

let defaultUserAgent: string | null = null;

export const getSettings = (): NormalizedSettings => {
  if (!cache) {
    cache = readFromDisk();
  }
  return cache;
};

export const setSettings = (partial: Partial<Settings>): NormalizedSettings => {
  const current = getSettings();
  const merged = deepMerge(current, deepMerge({} as Settings, partial));
  merged.version = 1;
  const next = normalizeSettings(settingsSchema.parse(merged));
  cache = next;
  writeToDisk(next);
  void applyDpiBypass(next.dpi);
  return next;
};

export const applyWindowSettings = (win: BrowserWindow, settings: NormalizedSettings['window']) => {
  if (!win || !settings) return;
  win.setResizable(settings.resizable);
  win.setMinimumSize(settings.minWidth, settings.minHeight);
  win.setAlwaysOnTop(settings.alwaysOnTop);

  const bounds = win.getBounds();
  const width = clamp(settings.width, settings.minWidth, 3840);
  const height = settings.height ? clamp(settings.height, settings.minHeight, 2160) : bounds.height;
  win.setBounds({ ...bounds, width, height }, false);

  if (settings.startState === 'maximized') {
    win.maximize();
  } else if (settings.startState === 'normal') {
    win.unmaximize();
  }
};

const getUserAgentValue = (mode: NormalizedSettings['ua']['mode'], custom: string) => {
  const fallback = defaultUserAgent ?? session.defaultSession.getUserAgent();
  switch (mode) {
    case 'chrome-desktop':
      return UA_DESKTOP;
    case 'chrome-android':
      return UA_ANDROID;
    case 'custom': {
      const trimmed = (custom || '').trim();
      return trimmed || UA_DESKTOP;
    }
    default:
      return fallback;
  }
};

export const applyUserAgent = async (
  mode: NormalizedSettings['ua']['mode'],
  custom: string,
  reload: boolean,
  win?: BrowserWindow | null
) => {
  const defaultSessionUA = session.defaultSession.getUserAgent();
  if (!defaultUserAgent) defaultUserAgent = defaultSessionUA;

  const targetUA = getUserAgentValue(mode, custom);
  const ytSession = session.fromPartition(WEBVIEW_PARTITION);

  session.defaultSession.setUserAgent(targetUA);
  ytSession.setUserAgent(targetUA);

  if (reload) {
    await ytSession.clearCache().catch(() => {});
    win?.webContents.reloadIgnoringCache();
  }
};

export const initializeSettings = (win: BrowserWindow) => {
  const settings = getSettings();
  applyWindowSettings(win, settings.window);
  void applyUserAgent(settings.ua.mode, settings.ua.custom, false, win);
  void applyDpiBypass(settings.dpi);
};
