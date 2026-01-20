import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../state/settings';
import { Settings, defaultSettings } from '../../../shared/settings';
import { X } from '../icons';

interface Props {
  onClose: () => void;
}

const moveItem = <T,>(arr: T[], index: number, direction: -1 | 1) => {
  const next = [...arr];
  const target = Math.min(next.length - 1, Math.max(0, index + direction));
  const tmp = next[target];
  next[target] = next[index];
  next[index] = tmp;
  return next;
};

type NormalizedSettings = {
  version: 1;
  window: NonNullable<Settings['window']>;
  ua: NonNullable<Settings['ua']>;
  dpi: NonNullable<Settings['dpi']>;
  adblock: NonNullable<Settings['adblock']>;
  ui: NonNullable<Settings['ui']>;
  fab: NonNullable<Settings['fab']>;
};

const defaultWindow: NormalizedSettings['window'] = {
  width: 1280,
  height: null,
  startState: 'last',
  alwaysOnTop: false,
  resizable: true,
  minWidth: 900,
  minHeight: 600
};

const defaultUa: NormalizedSettings['ua'] = {
  mode: 'default',
  custom: '',
  reloadOnChange: true
};

const defaultDpi: NormalizedSettings['dpi'] =
  defaultSettings.dpi ??
  ({ mode: 'off', port: 9880, bypass: 'localhost;127.0.0.1', autoStart: true } as NormalizedSettings['dpi']);

const defaultAdblock: NormalizedSettings['adblock'] =
  defaultSettings.adblock ?? ({ enabled: true, strength: 'full', cosmetics: true } as NormalizedSettings['adblock']);


const defaultUi: NormalizedSettings['ui'] = {
  language: 'en',
  theme: 'yt-dark',
  scale: 1,
  backdropOpacity: 0.2,
  animations: true,
  hotkeys: true,
  autoCloseOnNav: true,
  closeOnEsc: true,
  closeOnOutside: true,
  iconSet: 'lucide'
};

const defaultFab: NormalizedSettings['fab'] = {
  position: 'right-bottom',
  padding: 24,
  size: 'm',
  shape: 'circle',
  opacity: 1,
  hoverOpen: false,
  closeOnVideoClick: true,
  tooltips: true,
  buttonOrder: ['home', 'back', 'forward', 'refresh', 'search', 'settings']
};

const toNormalized = (incoming: Settings): NormalizedSettings => ({
  version: 1,
  window: { ...defaultWindow, ...(incoming.window ?? {}) },
  ua: { ...defaultUa, ...(incoming.ua ?? {}) },
  dpi: { ...defaultDpi, ...(incoming.dpi ?? {}) },
  adblock: { ...defaultAdblock, ...(incoming.adblock ?? {}) },
  ui: { ...defaultUi, ...(incoming.ui ?? {}) },
  fab: { ...defaultFab, ...(incoming.fab ?? {}) }
});

const SettingsOverlay = ({ onClose }: Props) => {
  const { t } = useTranslation();
  const { settings, setPartial } = useSettings();
  const safeSettings = useMemo<NormalizedSettings>(() => toNormalized(settings), [settings]);

  // Локальный черновик настроек (изменения не применяются мгновенно)
  const [draft, setDraft] = useState<NormalizedSettings>(safeSettings);
  const [customWidth, setCustomWidth] = useState(safeSettings.window.width.toString());
  const [customUA, setCustomUA] = useState(safeSettings.ua.custom);
  
  const dpiEnabled = draft.dpi.mode !== 'off';

  // При открытии или изменении исходных настроек обновляем черновик
  useEffect(() => {
    setDraft(safeSettings);
    setCustomWidth(safeSettings.window.width.toString());
    setCustomUA(safeSettings.ua.custom);
  }, [safeSettings]);

  // Обновления только в черновике
  const updateWindow = (partial: Partial<Settings['window']>) =>
    setDraft((d) => ({ ...d, window: { ...d.window, ...partial } }));
  const updateUA = (partial: Partial<Settings['ua']>) =>
    setDraft((d) => ({ ...d, ua: { ...d.ua, ...partial } }));
  const updateDpi = (partial: Partial<Settings['dpi']>) =>
    setDraft((d) => ({ ...d, dpi: { ...d.dpi, ...partial } }));
  const updateAdblock = (partial: Partial<Settings['adblock']>) =>
    setDraft((d) => ({ ...d, adblock: { ...d.adblock, ...partial } }));
  
  const updateUI = (partial: Partial<Settings['ui']>) =>
    setDraft((d) => ({ ...d, ui: { ...d.ui, ...partial } }));
  const updateFab = (partial: Partial<Settings['fab']>) =>
    setDraft((d) => ({ ...d, fab: { ...d.fab, ...partial } }));

  // Сохранение: применяем черновик к глобальным настройкам одной операцией
  const handleSave = () => {
    setPartial({
      window: draft.window,
      ua: draft.ua,
      dpi: draft.dpi,
      adblock: draft.adblock,
      
      ui: draft.ui,
      fab: draft.fab
    } as any);
    onClose();
  };

  const handleCancel = () => {
    onClose(); // просто закрываем, черновик отбрасывается
  };

  const widthOptions = [900, 1100, 1280, 1440, 1600, 1920];
  const isCustomWidth = !widthOptions.includes(draft.window.width);

  const applyWidth = (value: number) => {
    const width = clamp(value, 800, 3840);
    setCustomWidth(width.toString());
    updateWindow({ width });
  };

  const applyUA = (mode: NormalizedSettings['ua']['mode'], custom?: string) => {
    const nextCustom = mode === 'custom' ? (custom ?? safeSettings.ua.custom) : '';
    setCustomUA(nextCustom);
    updateUA({ mode, custom: nextCustom });
  };

  const fabSizeLabel = {
    s: 'S',
    m: 'M',
    l: 'L'
  } as const;

  const reorderButton = (index: number, dir: -1 | 1) => {
    const nextOrder = moveItem(draft.fab.buttonOrder, index, dir) as NormalizedSettings['fab']['buttonOrder'];
    updateFab({ buttonOrder: nextOrder });
  };

  return (
    <div className="fixed inset-0 z-[2147483100] flex items-center justify-center p-6" onClick={handleCancel}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(2px)'
        }}
      />
      <div
        className="pointer-events-auto relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border shadow-2xl ui-scrollbar"
        style={{
          background: 'var(--yt-surface)',
          borderColor: 'var(--yt-border)',
          boxShadow: 'var(--yt-shadow)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4"
          style={{ background: 'var(--yt-surface)', borderColor: 'var(--yt-border)' }}
        >
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--yt-text-secondary)' }}>
              {t('overlay.settings.title')}
            </p>
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--yt-text)' }}>
              {t('overlay.settings.title')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded px-3 py-2 text-sm"
              style={{
                background: 'var(--yt-surface-3)',
                color: 'var(--yt-text)',
                border: '1px solid var(--yt-border)'
              }}
            >
              {t('common.cancel') ?? 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded px-3 py-2 text-sm"
              style={{
                background: 'var(--yt-accent)',
                color: '#fff',
                border: '1px solid transparent'
              }}
            >
              {t('common.save') ?? 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full p-2 transition-colors hover:bg-[var(--yt-hover)]"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="grid gap-5 p-6">
          {/* 1. User Agent */}
          <section className="rounded-xl border p-5" style={{ borderColor: 'var(--yt-border)', background: 'var(--yt-surface-2)' }}>
            <div className="mb-3">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--yt-text)' }}>{t('overlay.settings.userAgent.title')}</h3>
              <p className="text-sm" style={{ color: 'var(--yt-text-secondary)' }}>
                {t('overlay.settings.userAgent.description')}
              </p>
            </div>
            <div className="grid gap-3">
              <select
                value={draft.ua.mode}
                onChange={(e) => applyUA(e.target.value as NormalizedSettings['ua']['mode'])}
                className="w-full h-10 rounded-lg border bg-[var(--yt-surface-3)] px-3 text-sm"
                style={{ borderColor: 'var(--yt-border)', color: 'var(--yt-text)' }}
              >
                <option value="default">{t('overlay.settings.userAgent.modeOptions.default')}</option>
                <option value="chrome-desktop">{t('overlay.settings.userAgent.modeOptions.chromeDesktop')}</option>
                <option value="chrome-android">{t('overlay.settings.userAgent.modeOptions.chromeAndroid')}</option>
                <option value="custom">{t('overlay.settings.userAgent.modeOptions.custom')}</option>
              </select>
              {draft.ua.mode === 'custom' && (
                <textarea
                  value={customUA}
                  onChange={(e) => setCustomUA(e.target.value)}
                  onBlur={() => applyUA('custom', customUA)}
                  maxLength={512}
                  className="w-full rounded-lg border bg-[var(--yt-surface-3)] px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--yt-border)', color: 'var(--yt-text)', minHeight: 72 }}
                  placeholder={t('overlay.settings.userAgent.customPlaceholder')}
                />
              )}
              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--yt-text)' }}>
                <input
                  type="checkbox"
                  checked={draft.ua.reloadOnChange}
                  onChange={(e) => updateUA({ reloadOnChange: e.target.checked })}
                />
                {t('overlay.settings.userAgent.reloadOnChange')}
              </label>
            </div>
          </section>

          {/* 2. DPI Bypass */}
          <section className="rounded-xl border p-5" style={{ borderColor: 'var(--yt-border)', background: 'var(--yt-surface-2)' }}>
            <div className="mb-3">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--yt-text)' }}>{t('overlay.settings.dpi.title')}</h3>
              <p className="text-sm" style={{ color: 'var(--yt-text-secondary)' }}>
                {t('overlay.settings.dpi.description')}
              </p>
            </div>

            <div className="space-y-4">
              {/* Mode select */}
              <div className="grid gap-1">
                <label className="text-sm font-semibold" style={{ color: 'var(--yt-text-secondary)' }}>{t('overlay.settings.dpi.mode')}</label>
                <select
                  value={draft.dpi.mode}
                  onChange={(e) => updateDpi({ mode: e.target.value as NormalizedSettings['dpi']['mode'] })}
                  className="w-full h-10 rounded-lg border bg-[var(--yt-surface-3)] px-3 text-sm"
                  style={{ borderColor: 'var(--yt-border)', color: 'var(--yt-text)' }}
                >
                  <option value="off">{t('overlay.settings.dpi.modeOptions.off')}</option>
                  <option value="demergi">{t('overlay.settings.dpi.modeOptions.demergi')}</option>
                </select>
              </div>

              {/* Proxy port */}
              <div className="grid gap-4">
                <div className="grid gap-1">
                  <label className="text-sm font-semibold" style={{ color: 'var(--yt-text-secondary)' }}>{t('overlay.settings.dpi.port')}</label>
                  <input
                    type="number"
                    min={1}
                    max={65535}
                    value={draft.dpi.port}
                    disabled={!dpiEnabled}
                    onChange={(e) => {
                      const nextPort = clamp(Number(e.target.value) || draft.dpi.port, 1, 65535);
                      updateDpi({ port: nextPort });
                    }}
                    className="w-full rounded-lg border bg-[var(--yt-surface-3)] px-3 py-2 text-sm"
                    style={{ borderColor: 'var(--yt-border)', color: 'var(--yt-text)' }}
                  />
                </div>
              </div>

              {/* Bypass list */}
              <div className="grid gap-1">
                <label className="text-sm font-semibold" style={{ color: 'var(--yt-text-secondary)' }}>{t('overlay.settings.dpi.bypass')}</label>
                <input
                  type="text"
                  value={draft.dpi.bypass}
                  disabled={!dpiEnabled}
                  onChange={(e) => updateDpi({ bypass: e.target.value })}
                  className="w-full rounded-lg border bg-[var(--yt-surface-3)] px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--yt-border)', color: 'var(--yt-text)' }}
                  placeholder="localhost;127.0.0.1"
                />
                <p className="text-xs" style={{ color: 'var(--yt-text-secondary)' }}>
                  {t('overlay.settings.dpi.hint')}
                </p>
              </div>

              {/* Demergi-specific options */}
              {draft.dpi.mode === 'demergi' && (
                <div className="flex items-center gap-2">
                  <input
                    id="dpi-auto"
                    type="checkbox"
                    checked={draft.dpi.autoStart}
                    onChange={(e) => updateDpi({ autoStart: e.target.checked })}
                  />
                  <label htmlFor="dpi-auto" className="text-sm" style={{ color: 'var(--yt-text)' }}>
                    {t('overlay.settings.dpi.autoStart')}
                  </label>
                </div>
              )}
            </div>
          </section>

          {/* 3. Adblocker */}
          <section className="rounded-xl border p-5" style={{ borderColor: 'var(--yt-border)', background: 'var(--yt-surface-2)' }}>
            <div className="mb-3">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--yt-text)' }}>Adblocker</h3>
              <p className="text-sm" style={{ color: 'var(--yt-text-secondary)' }}>
                Блокировка рекламы и трекеров, косметические фильтры.
              </p>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--yt-text)' }}>
                <input type="checkbox" checked={draft.adblock.enabled} onChange={(e) => updateAdblock({ enabled: e.target.checked })} />
                Включить Adblocker
              </label>
              <div className="grid gap-1">
                <label className="text-sm font-semibold" style={{ color: 'var(--yt-text-secondary)' }}>Сила блокировки</label>
                <select
                  value={draft.adblock.strength}
                  onChange={(e) => updateAdblock({ strength: e.target.value as any })}
                  className="w-full h-10 rounded-lg border bg-[var(--yt-surface-3)] px-3 text-sm"
                  style={{ borderColor: 'var(--yt-border)', color: 'var(--yt-text)' }}
                >
                  <option value="ads">Только реклама</option>
                  <option value="ads-and-tracking">Реклама + трекеры</option>
                  <option value="full">Полные списки</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--yt-text)' }}>
                <input type="checkbox" checked={draft.adblock.cosmetics} onChange={(e) => updateAdblock({ cosmetics: e.target.checked })} />
                Косметические фильтры (скрытие элементов)
              </label>

              <AdblockStatsPanel />
            </div>
          </section>

          {/* 4. Interface */}
          <section className="rounded-xl border p-5" style={{ borderColor: 'var(--yt-border)', background: 'var(--yt-surface-2)' }}>
            <div className="mb-3">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--yt-text)' }}>{t('overlay.settings.interface.title')}</h3>
              <p className="text-sm" style={{ color: 'var(--yt-text-secondary)' }}>
                {t('overlay.settings.interface.description')}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: 'var(--yt-text-secondary)' }}>{t('overlay.settings.interface.language')}</label>
                <select
                  value={draft.ui.language}
                  onChange={(e) => updateUI({ language: e.target.value as NormalizedSettings['ui']['language'] })}
                  className="w-full h-10 rounded-lg border bg-[var(--yt-surface-3)] px-3 text-sm"
                  style={{ borderColor: 'var(--yt-border)', color: 'var(--yt-text)' }}
                >
                  <option value="en">{t('overlay.settings.interface.languageOptions.en')}</option>
                  <option value="ru">{t('overlay.settings.interface.languageOptions.ru')}</option>
                </select>

                <label className="text-sm font-semibold" style={{ color: 'var(--yt-text-secondary)' }}>{t('overlay.settings.interface.theme')}</label>
                <select
                  value={draft.ui.theme}
                  onChange={(e) => updateUI({ theme: e.target.value as NormalizedSettings['ui']['theme'] })}
                  className="w-full h-10 rounded-lg border bg-[var(--yt-surface-3)] px-3 text-sm"
                  style={{ borderColor: 'var(--yt-border)', color: 'var(--yt-text)' }}
                >
                  <option value="yt-dark">{t('overlay.settings.interface.themeOptions.ytDark')}</option>
                  <option value="yt-light">{t('overlay.settings.interface.themeOptions.ytLight')}</option>
                  <option value="auto">{t('overlay.settings.interface.themeOptions.auto')}</option>
                </select>

                <label className="text-sm font-semibold" style={{ color: 'var(--yt-text-secondary)' }}>{t('overlay.settings.interface.scale')}</label>
                <select
                  value={draft.ui.scale}
                  onChange={(e) => updateUI({ scale: Number(e.target.value) as NormalizedSettings['ui']['scale'] })}
                  className="w-full h-10 rounded-lg border bg-[var(--yt-surface-3)] px-3 text-sm"
                  style={{ borderColor: 'var(--yt-border)', color: 'var(--yt-text)' }}
                >
                  {[0.9, 1, 1.1, 1.25].map((s) => (
                    <option key={s} value={s}>{Math.round(s * 100)}%</option>
                  ))}
                </select>

                <label className="text-sm font-semibold" style={{ color: 'var(--yt-text-secondary)' }}>{t('overlay.settings.interface.backdropOpacity')}</label>
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={5}
                  value={Math.round(draft.ui.backdropOpacity * 100)}
                  onChange={(e) => updateUI({ backdropOpacity: Number(e.target.value) / 100 })}
                  style={{ accentColor: 'var(--yt-accent)', width: '100%' }}
                />
                <div className="text-xs" style={{ color: 'var(--yt-text-secondary)' }}>
                  {Math.round(draft.ui.backdropOpacity * 100)}%
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--yt-text)' }}>
                  <input type="checkbox" checked={draft.ui.animations} onChange={(e) => updateUI({ animations: e.target.checked })} />
                  {t('overlay.settings.interface.animations')}
                </label>
                <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--yt-text)' }}>
                  <input type="checkbox" checked={draft.ui.hotkeys} onChange={(e) => updateUI({ hotkeys: e.target.checked })} />
                  {t('overlay.settings.interface.hotkeys')}
                </label>
                <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--yt-text)' }}>
                  <input type="checkbox" checked={draft.ui.autoCloseOnNav} onChange={(e) => updateUI({ autoCloseOnNav: e.target.checked })} />
                  {t('overlay.settings.interface.autoCloseOnNav')}
                </label>
                <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--yt-text)' }}>
                  <input type="checkbox" checked={draft.ui.closeOnEsc} onChange={(e) => updateUI({ closeOnEsc: e.target.checked })} />
                  {t('overlay.settings.interface.closeOnEsc')}
                </label>
                <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--yt-text)' }}>
                  <input type="checkbox" checked={draft.ui.closeOnOutside} onChange={(e) => updateUI({ closeOnOutside: e.target.checked })} />
                  {t('overlay.settings.interface.closeOnOutside')}
                </label>
                <div className="flex flex-col gap-1 pt-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--yt-text)' }}>
                    {t('overlay.settings.interface.iconSet')}
                  </label>
                  <select
                    value={draft.ui.iconSet}
                    onChange={(e) => updateUI({ iconSet: e.target.value as 'lucide' | 'material' })}
                    className="rounded border px-2 py-1 text-sm"
                    style={{
                      background: 'var(--yt-surface-3)',
                      color: 'var(--yt-text)',
                      borderColor: 'var(--yt-border)'
                    }}
                  >
                    <option value="lucide">{t('overlay.settings.interface.iconSetLucide')}</option>
                    <option value="material">{t('overlay.settings.interface.iconSetMaterial')}</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Window */}
          <section className="rounded-xl border p-5" style={{ borderColor: 'var(--yt-border)', background: 'var(--yt-surface-2)' }}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--yt-text)' }}>{t('overlay.settings.window.title')}</h3>
                <p className="text-sm" style={{ color: 'var(--yt-text-secondary)' }}>
                  {t('overlay.settings.window.description')}
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold" style={{ color: 'var(--yt-text-secondary)' }}>{t('overlay.settings.window.width')}</label>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {widthOptions.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => applyWidth(w)}
                      className="rounded-lg px-3 py-2 text-sm"
                      style={{
                        background: draft.window.width === w ? 'var(--yt-accent)' : 'var(--yt-surface-3)',
                        color: draft.window.width === w ? '#fff' : 'var(--yt-text)',
                        border: draft.window.width === w ? '1px solid transparent' : '1px solid var(--yt-border)'
                      }}
                    >
                      {w}px
                    </button>
                  ))}
                  <input
                    type="number"
                    min={800}
                    max={3840}
                    step={10}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    onBlur={() => applyWidth(Number(customWidth) || draft.window.width)}
                    className="w-24 rounded-lg border bg-transparent px-3 py-2 text-sm"
                    style={{ borderColor: 'var(--yt-border)', color: 'var(--yt-text)' }}
                    placeholder="Custom"
                  />
                  {isCustomWidth && (
                    <span className="text-xs" style={{ color: 'var(--yt-text-secondary)' }}>
                      {t('overlay.settings.window.widthCustom')}: {draft.window.width}px
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-3">
                <label className="text-sm font-semibold" style={{ color: 'var(--yt-text-secondary)' }}>{t('overlay.settings.window.startState')}</label>
                <select
                  value={draft.window.startState}
                  onChange={(e) => updateWindow({ startState: e.target.value as NormalizedSettings['window']['startState'] })}
                  className="w-full h-10 rounded-lg border bg-[var(--yt-surface-3)] px-3 text-sm"
                  style={{ borderColor: 'var(--yt-border)', color: 'var(--yt-text)' }}
                >
                  <option value="last">{t('overlay.settings.window.startStateOptions.last')}</option>
                  <option value="maximized">{t('overlay.settings.window.startStateOptions.maximized')}</option>
                  <option value="normal">{t('overlay.settings.window.startStateOptions.normal')}</option>
                </select>

                <div className="flex items-center gap-2">
                  <input
                    id="always-top"
                    type="checkbox"
                    checked={draft.window.alwaysOnTop}
                    onChange={(e) => updateWindow({ alwaysOnTop: e.target.checked })}
                  />
                  <label htmlFor="always-top" className="text-sm" style={{ color: 'var(--yt-text)' }}>
                    {t('overlay.settings.window.alwaysOnTop')}
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="resizable"
                    type="checkbox"
                    checked={draft.window.resizable}
                    onChange={(e) => updateWindow({ resizable: e.target.checked })}
                  />
                  <label htmlFor="resizable" className="text-sm" style={{ color: 'var(--yt-text)' }}>
                    {t('overlay.settings.window.resizable')}
                  </label>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs" style={{ color: 'var(--yt-text-secondary)' }}>{t('overlay.settings.window.minWidth')}</label>
                    <input
                      type="number"
                      min={640}
                      max={3840}
                      value={draft.window.minWidth}
                      onChange={(e) => updateWindow({ minWidth: Number(e.target.value) })}
                      className="w-full rounded-lg border bg-[var(--yt-surface-3)] px-3 py-2 text-sm"
                      style={{ borderColor: 'var(--yt-border)', color: 'var(--yt-text)' }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs" style={{ color: 'var(--yt-text-secondary)' }}>{t('overlay.settings.window.minHeight')}</label>
                    <input
                      type="number"
                      min={480}
                      max={2160}
                      value={draft.window.minHeight}
                      onChange={(e) => updateWindow({ minHeight: Number(e.target.value) })}
                      className="w-full rounded-lg border bg-[var(--yt-surface-3)] px-3 py-2 text-sm"
                      style={{ borderColor: 'var(--yt-border)', color: 'var(--yt-text)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. FAB */}
          <section className="rounded-xl border p-5" style={{ borderColor: 'var(--yt-border)', background: 'var(--yt-surface-2)' }}>
            <div className="mb-3">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--yt-text)' }}>{t('overlay.settings.fab.title')}</h3>
              <p className="text-sm" style={{ color: 'var(--yt-text-secondary)' }}>
                {t('overlay.settings.fab.description')}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-semibold" style={{ color: 'var(--yt-text-secondary)' }}>{t('overlay.settings.fab.position')}</label>
                <select
                  value={draft.fab.position}
                  onChange={(e) => updateFab({ position: e.target.value as NormalizedSettings['fab']['position'] })}
                  className="w-full rounded-lg border bg-[var(--yt-surface-3)] px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--yt-border)', color: 'var(--yt-text)' }}
                >
                  <option value="right-bottom">{t('overlay.settings.fab.positionOptions.rightBottom')}</option>
                  <option value="left-bottom">{t('overlay.settings.fab.positionOptions.leftBottom')}</option>
                </select>

                <label className="text-sm font-semibold" style={{ color: 'var(--yt-text-secondary)' }}>{t('overlay.settings.fab.padding')}</label>
                <input
                  type="range"
                  min={8}
                  max={32}
                  step={1}
                  value={draft.fab.padding}
                  onChange={(e) => updateFab({ padding: Number(e.target.value) })}
                  style={{ accentColor: 'var(--yt-accent)', width: '100%' }}
                />
                <div className="text-xs" style={{ color: 'var(--yt-text-secondary)' }}>{draft.fab.padding}px</div>

                <label className="text-sm font-semibold" style={{ color: 'var(--yt-text-secondary)' }}>{t('overlay.settings.fab.size')}</label>
                <select
                  value={draft.fab.size}
                  onChange={(e) => updateFab({ size: e.target.value as NormalizedSettings['fab']['size'] })}
                  className="w-full rounded-lg border bg-[var(--yt-surface-3)] px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--yt-border)', color: 'var(--yt-text)' }}
                >
                  {(['s', 'm', 'l'] as const).map((s) => (
                    <option key={s} value={s}>
                      {t(`overlay.settings.fab.sizeOptions.${s}`)}
                    </option>
                  ))}
                </select>

                <label className="text-sm font-semibold" style={{ color: 'var(--yt-text-secondary)' }}>{t('overlay.settings.fab.opacity')}</label>
                <input
                  type="range"
                  min={60}
                  max={100}
                  step={5}
                  value={Math.round(draft.fab.opacity * 100)}
                  onChange={(e) => updateFab({ opacity: Number(e.target.value) / 100 })}
                  style={{ accentColor: 'var(--yt-accent)', width: '100%' }}
                />
                <div className="text-xs" style={{ color: 'var(--yt-text-secondary)' }}>
                  {Math.round(draft.fab.opacity * 100)}%
                </div>

                <label className="text-sm font-semibold" style={{ color: 'var(--yt-text-secondary)' }}>{t('overlay.settings.fab.style')}</label>
                <select
                  value={draft.fab.shape}
                  onChange={(e) => updateFab({ shape: e.target.value as NormalizedSettings['fab']['shape'] })}
                  className="w-full rounded-lg border bg-[var(--yt-surface-3)] px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--yt-border)', color: 'var(--yt-text)' }}
                >
                  <option value="circle">{t('overlay.settings.fab.styleOptions.circle')}</option>
                  <option value="rounded">{t('overlay.settings.fab.styleOptions.rounded')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--yt-text)' }}>
                  <input type="checkbox" checked={draft.fab.hoverOpen} onChange={(e) => updateFab({ hoverOpen: e.target.checked })} />
                  {t('overlay.settings.fab.hoverOpen')}
                </label>
                <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--yt-text)' }}>
                  <input
                    type="checkbox"
                    checked={draft.fab.closeOnVideoClick}
                    onChange={(e) => updateFab({ closeOnVideoClick: e.target.checked })}
                  />
                  {t('overlay.settings.fab.closeOnVideoClick')}
                </label>
                <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--yt-text)' }}>
                  <input type="checkbox" checked={draft.fab.tooltips} onChange={(e) => updateFab({ tooltips: e.target.checked })} />
                  {t('overlay.settings.fab.tooltips')}
                </label>

                <div className="mt-2 rounded-lg border p-3" style={{ borderColor: 'var(--yt-border)', background: 'var(--yt-surface-3)' }}>
                  <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--yt-text)' }}>{t('overlay.settings.fab.buttonOrder')}</p>
                  <div className="space-y-2">
                    {draft.fab.buttonOrder.map((btn, idx) => (
                      <div key={btn + idx} className="flex items-center justify-between rounded border px-3 py-2" style={{ borderColor: 'var(--yt-border)' }}>
                        <span className="text-sm" style={{ color: 'var(--yt-text)' }}>{btn}</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="rounded bg-[var(--yt-surface-2)] px-2 text-xs"
                            style={{ border: '1px solid var(--yt-border)', color: 'var(--yt-text)' }}
                            onClick={() => reorderButton(idx, -1)}
                            disabled={idx === 0}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="rounded bg-[var(--yt-surface-2)] px-2 text-xs"
                            style={{ border: '1px solid var(--yt-border)', color: 'var(--yt-text)' }}
                            onClick={() => reorderButton(idx, 1)}
                            disabled={idx === draft.fab.buttonOrder.length - 1}
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 7. DevTools */}
          <section className="rounded-xl border p-5" style={{ borderColor: 'var(--yt-border)', background: 'var(--yt-surface-2)' }}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--yt-text)' }}>DevTools</h3>
                <p className="text-sm" style={{ color: 'var(--yt-text-secondary)' }}>
                  Открывайте инструменты разработчика вручную при необходимости.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => window.orion.devtools.openMain()}
                  className="rounded px-3 py-2 text-sm"
                  style={{
                    background: 'var(--yt-surface-3)',
                    color: 'var(--yt-text)',
                    border: '1px solid var(--yt-border)'
                  }}
                >
                  DevTools окна
                </button>
                <button
                  type="button"
                  onClick={() => window.orion.devtools.openWebview()}
                  className="rounded px-3 py-2 text-sm"
                  style={{
                    background: 'var(--yt-accent)',
                    color: '#fff',
                    border: '1px solid transparent'
                  }}
                >
                  DevTools YouTube
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;

const AdblockStatsPanel = () => {
  const [stats, setStats] = useState<{ blocked: number; redirected: number; whitelisted: number; styles: number; scripts: number; csp: number } | null>(null);
  useEffect(() => {
    const handler = (payload: any) => setStats(payload);
    window.orion.events.on('adblocker:stats', handler);
    return () => window.orion.events.off('adblocker:stats', handler);
  }, []);
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: 'var(--yt-border)', background: 'var(--yt-surface-3)' }}>
      <p className="text-sm font-semibold mb-2" style={{ color: 'var(--yt-text)' }}>Статистика</p>
      {stats ? (
        <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--yt-text-secondary)' }}>
          <div>Заблокировано: {stats.blocked}</div>
          <div>Редиректы: {stats.redirected}</div>
          <div>Белый список: {stats.whitelisted}</div>
          <div>CSS инъекции: {stats.styles}</div>
          <div>JS инъекции: {stats.scripts}</div>
          <div>CSP: {stats.csp}</div>
        </div>
      ) : (
        <div className="text-xs" style={{ color: 'var(--yt-text-secondary)' }}>Нет данных</div>
      )}
    </div>
  );
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

