console.log('[main] === STARTING MAIN PROCESS ===');
console.log('[main] Node:', process.version, 'Platform:', process.platform);

import path from 'node:path';
import { app, BrowserWindow, ipcMain, shell, net, session, Menu, webContents, screen } from 'electron';
import { ElectronBlocker, fullLists } from '@ghostery/adblocker-electron';
import fetch from 'cross-fetch';
import { applyUserAgent, applyWindowSettings, getSettings, initializeSettings, setSettings } from './settings';
import { stopDpiProcess, ensureDemergi } from './dpiManager';
import { initVOTBridge } from './votBridge';
import { EventEmitter } from 'events';

console.log('[main] Imports loaded');

// Increase max listeners to prevent warnings
EventEmitter.defaultMaxListeners = 20;


const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
const WEBVIEW_PRELOAD = path.join(__dirname, 'webviewPreload.js');
const ALLOWED_WEBVIEW_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'm.youtube.com',
  'youtu.be'
]);

let mainWindow: BrowserWindow | null = null;
let adblocker: ElectronBlocker | null = null;

// Quick connectivity check to YouTube (small resource, short timeout)
const canReachYouTube = (timeoutMs = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const request = net.request({
        method: 'GET',
        url: 'https://www.youtube.com/favicon.ico'
      });
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          try { request.abort(); } catch {}
          resolve(false);
        }
      }, timeoutMs);
      request.on('response', (response) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          const ok = response.statusCode >= 200 && response.statusCode < 500;
          resolve(ok);
        }
      });
      request.on('error', () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(false);
        }
      });
      request.end();
    } catch {
      resolve(false);
    }
  });
};

// Initialize network ad blocker for Electron sessions
type AdblockStrength = 'ads' | 'ads-and-tracking' | 'full';
type AdblockConfig = { enabled: boolean; strength: AdblockStrength; cosmetics: boolean };

const adblockStats = { blocked: 0, redirected: 0, whitelisted: 0, styles: 0, scripts: 0, csp: 0 };
let adblockStatsTimer: NodeJS.Timeout | null = null;

const teardownAdblocker = async () => {
  try {
    if (adblocker) {
      try {
        const ytSession = session.fromPartition('persist:orion-youtube');
        if (ytSession) {
          await adblocker.disableBlockingInSession(ytSession);
        }
      } catch (err) {
        // Ignore "not enabled" errors during cleanup
        if (!err?.message?.includes('not enabled')) {
          console.warn('[main] Error disabling adblocker in ytSession:', err);
        }
      }
      adblocker = null;
    }
  } catch (err) {
    console.warn('[main] Error during adblocker teardown:', err);
  }
  if (adblockStatsTimer) {
    clearInterval(adblockStatsTimer);
    adblockStatsTimer = null;
  }
};

const setupAdblocker = async (cfg: AdblockConfig) => {
  try {
    await teardownAdblocker();
    if (!cfg.enabled) {
      console.log('[main] Adblocker disabled');
      return;
    }
    const cosmeticsSupported = typeof (session.defaultSession as any).registerPreloadScript === 'function';
    const loadCosmetics = cfg.cosmetics && cosmeticsSupported;
    if (cfg.cosmetics && !cosmeticsSupported) {
      console.warn('[main] Cosmetic filters disabled: session.registerPreloadScript not available in this Electron version');
    }
    if (cfg.strength === 'ads') {
      adblocker = await ElectronBlocker.fromPrebuiltAdsOnly(fetch);
    } else if (cfg.strength === 'full') {
      adblocker = await ElectronBlocker.fromLists(fetch, fullLists, { enableCompression: true });
    } else {
      adblocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch);
    }
    const ytSession = session.fromPartition('persist:orion-youtube');
    adblocker.enableBlockingInSession(ytSession);
    // Stats
    adblockStats.blocked = 0;
    adblockStats.redirected = 0;
    adblockStats.whitelisted = 0;
    adblockStats.styles = 0;
    adblockStats.scripts = 0;
    adblockStats.csp = 0;
    // @ts-ignore
    adblocker.on('request-blocked', () => { adblockStats.blocked++; });
    // @ts-ignore
    adblocker.on('request-redirected', () => { adblockStats.redirected++; });
    // @ts-ignore
    adblocker.on('request-whitelisted', () => { adblockStats.whitelisted++; });
    // @ts-ignore
    adblocker.on('style-injected', () => { adblockStats.styles++; });
    // @ts-ignore
    adblocker.on('script-injected', () => { adblockStats.scripts++; });
    // @ts-ignore
    adblocker.on('csp-injected', () => { adblockStats.csp++; });
    adblockStatsTimer = setInterval(() => {
      try {
        if (mainWindow) mainWindow.webContents.send('adblocker:stats', { ...adblockStats });
      } catch {}
    }, 5000);
    console.log('[main] Adblocker enabled in sessions');
  } catch (err) {
    console.warn('[main] Failed to initialize adblocker:', err);
  }
};

const createMainWindow = () => {
  console.log('[main] Creating main window...');

  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 600,
    title: "Orion's Gate",
    backgroundColor: '#0f0f0f',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      devTools: true,
      webviewTag: true,
      nodeIntegrationInSubFrames: false
    }
  });

  mainWindow = win;

  initializeSettings(win);
  console.log('[main] Main window created and settings initialized');

  // Увеличиваем лимит слушателей для WebContents чтобы избежать warning
  win.webContents.setMaxListeners(20);

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    console.log('[main] Loading dev server from:', process.env.VITE_DEV_SERVER_URL);
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    const htmlPath = path.join(__dirname, 'renderer/index.html');
    console.log('[main] Loading file:', htmlPath);
    win.loadFile(htmlPath);
  }

  // Center window and show it after content loads
  win.once('ready-to-show', () => {
    try {
      win.center();
      console.log('[main] Window centered and shown');
    } catch (err) {
      console.warn('[main] Failed to center window:', err);
    }
    win.show();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.on('closed', () => {
    mainWindow = null;
  });

  win.on('resize', () => {
    const bounds = win.getBounds();
    const current = getSettings();
    setSettings({ window: { width: bounds.width, height: bounds.height } } as any);
  });

  return win;
};

app.on('web-contents-created', (_event, contents) => {
  if (contents.getType() === 'webview') {
    return;
  }

  contents.on('will-attach-webview', (event, webPreferences, params) => {
    try {
      const src = params?.src ?? '';
      const url = new URL(src);
      if (!ALLOWED_WEBVIEW_HOSTS.has(url.hostname)) {
        event.preventDefault();
        return;
      }
    } catch {
      event.preventDefault();
      return;
    }

    webPreferences.preload = WEBVIEW_PRELOAD;
    webPreferences.contextIsolation = true;
    webPreferences.nodeIntegration = false;
    webPreferences.sandbox = true;
    webPreferences.devTools = true; // Always enable for debugging
    webPreferences.nodeIntegrationInSubFrames = false;
    webPreferences.webviewTag = true;
    params.partition = 'persist:orion-youtube';
    
    console.log('[main] Webview preload set to:', WEBVIEW_PRELOAD);
  });
});

app.whenReady().then(async () => {
  console.log('[main] APP STARTING');
  console.log('[main] isDev:', isDev);
  console.log('[main] __dirname:', __dirname);

  // Initialize DPI bypass BEFORE creating windows - this applies to entire app
  try {
    const settings = getSettings();
    await setupAdblocker({ enabled: Boolean(settings.adblock?.enabled ?? true), strength: (settings.adblock?.strength ?? 'full') as AdblockStrength, cosmetics: Boolean(settings.adblock?.cosmetics ?? true) });
    if (settings.dpi.mode === 'off') {
      const directOk = await canReachYouTube(5000);
      console.log('[main] Direct connectivity check to YouTube:', directOk ? 'OK' : 'FAILED');
      if (!directOk) {
        const next = { ...settings, dpi: { ...settings.dpi, mode: 'demergi' } } as any;
        setSettings(next);
        console.log('[main] Direct failed, enabling demergi...');
        const ok = await ensureDemergi(next.dpi);
        if (ok) {
          app.commandLine.appendSwitch('proxy-server', `http://127.0.0.1:${next.dpi.port}`);
          if (next.dpi.bypass) app.commandLine.appendSwitch('proxy-bypass-list', next.dpi.bypass);
          console.log('[main] App-level proxy configured:', `http://127.0.0.1:${next.dpi.port}`);
        } else {
          console.log('[main] Failed to initialize DPI proxy after direct failure');
        }
      } else {
        console.log('[main] Keeping direct mode: off');
      }
    } else if (settings.dpi.mode === 'demergi' && settings.dpi.autoStart) {
      console.log('[main] DPI bypass enabled, starting proxy...');
      const ok = await ensureDemergi(settings.dpi);
      if (ok) {
        app.commandLine.appendSwitch('proxy-server', `http://127.0.0.1:${settings.dpi.port}`);
        if (settings.dpi.bypass) app.commandLine.appendSwitch('proxy-bypass-list', settings.dpi.bypass);
        console.log('[main] App-level proxy configured:', `http://127.0.0.1:${settings.dpi.port}`);
        const viaProxyOk = await canReachYouTube(5000);
        console.log('[main] Proxy connectivity check to YouTube:', viaProxyOk ? 'OK' : 'FAILED');
        if (!viaProxyOk) {
          console.log('[main] Proxy failed, disabling demergi (direct mode)');
          setSettings({ dpi: { ...settings.dpi, mode: 'off' } } as any);
          await stopDpiProcess();
          try {
            await session.defaultSession?.setProxy({ mode: 'direct' } as any);
          } catch {}
        }
      } else {
        console.log('[main] Failed to initialize DPI proxy');
      }
    } else {
      console.log('[main] DPI bypass disabled or autoStart false');
    }
  } catch (err) {
    console.error('[main] Error initializing DPI bypass:', err);
  }

  createMainWindow();
  
  // Initialize VOT Bridge for Voice Over Translation support
  initVOTBridge();

  // Setup download handler for VOT
  session.defaultSession?.on('will-download', (event, item, webContents) => {
    const fileName = item.getFilename();
    const filePath = path.join(app.getPath('downloads'), fileName);
    item.setSavePath(filePath);
    console.log(`[VOT] Download started: ${fileName} → ${filePath}`);
  });
  
  // Create application menu with Orion Userscripts item
  const menuTemplate: any[] = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        { type: 'separator' },
        { role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Orion\'s Gate',
          click: () => {
            shell.openExternal('https://github.com');
          }
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    void stopDpiProcess();
    app.quit();
  }
});

app.on('before-quit', () => {
  void stopDpiProcess();
});

ipcMain.handle('ping', async () => 'pong');

ipcMain.handle('navigation:home', async () => {
  if (!mainWindow) return;
  mainWindow.webContents.send('webview:navigate', 'https://www.youtube.com');
});

ipcMain.handle('navigation:back', async () => {
  if (!mainWindow) return;
  mainWindow.webContents.send('webview:back');
});

ipcMain.handle('navigation:forward', async () => {
  if (!mainWindow) return;
  mainWindow.webContents.send('webview:forward');
});

ipcMain.handle('navigation:search', async (_event, query: string) => {
  if (!mainWindow) return;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  mainWindow.webContents.send('webview:navigate', searchUrl);
});

ipcMain.handle('navigation:refresh', async () => {
  if (!mainWindow) return;
  mainWindow.webContents.send('webview:refresh');
});

ipcMain.handle('devtools:open-main', async () => {
  if (!mainWindow) return false;
  mainWindow.webContents.openDevTools({ mode: 'detach' });
  return true;
});

ipcMain.handle('devtools:open-webview', async () => {
  const guest = webContents.getAllWebContents().find((wc) => wc.getType() === 'webview');
  if (guest) {
    guest.openDevTools({ mode: 'detach' });
    return true;
  }
  return false;
});

ipcMain.handle('settings:get', async () => {
  return getSettings();
});

ipcMain.handle('settings:set', async (_event, partial) => {
  const next = setSettings(partial);
  if (mainWindow) {
    applyWindowSettings(mainWindow, next.window);
    if (next.ua) {
      await applyUserAgent(next.ua.mode, next.ua.custom, next.ua.reloadOnChange, mainWindow);
    }
    if (next.adblock) {
      await setupAdblocker({ enabled: Boolean(next.adblock.enabled ?? true), strength: (next.adblock.strength ?? 'full') as AdblockStrength, cosmetics: Boolean(next.adblock.cosmetics ?? true) });
    }
    mainWindow.webContents.send('settings:changed', next);
  }
  return next;
});

// Catch uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[main] Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[main] Unhandled rejection:', reason);
  process.exit(1);
});
