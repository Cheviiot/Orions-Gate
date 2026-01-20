import { useEffect } from 'react';
import { create } from 'zustand';
import { Settings, defaultSettings } from '../../shared/settings';

interface SettingsStore {
  settings: Settings;
  ready: boolean;
  setPartial: (partial: Partial<Settings>) => Promise<void>;
}

const applyOverlayVars = (settings?: Settings) => {
  if (!settings?.ui) return;

  const root = document.documentElement;
  root.style.setProperty('--overlay-scale', settings.ui.scale.toString());
  root.style.setProperty('--overlay-backdrop', `rgba(0,0,0,${settings.ui.backdropOpacity})`);

  const isLight =
    settings.ui.theme === 'yt-light' ||
    (settings.ui.theme === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);

  if (isLight) {
    root.style.setProperty('--yt-bg', '#f8f8f8');
    root.style.setProperty('--yt-surface', '#ffffff');
    root.style.setProperty('--yt-surface-2', '#f1f1f1');
    root.style.setProperty('--yt-surface-3', '#e9e9e9');
    root.style.setProperty('--yt-text', '#0f0f0f');
    root.style.setProperty('--yt-text-secondary', 'rgba(0,0,0,0.7)');
    root.style.setProperty('--yt-border', 'rgba(0,0,0,0.08)');
  } else {
    root.style.setProperty('--yt-bg', '#0f0f0f');
    root.style.setProperty('--yt-surface', '#181818');
    root.style.setProperty('--yt-surface-2', '#202020');
    root.style.setProperty('--yt-surface-3', '#272727');
    root.style.setProperty('--yt-text', 'rgba(255,255,255,0.9)');
    root.style.setProperty('--yt-text-secondary', 'rgba(255,255,255,0.6)');
    root.style.setProperty('--yt-border', 'rgba(255,255,255,0.08)');
  }
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: defaultSettings,
  ready: false,
  setPartial: async (partial) => {
    const next = await window.orion.settings.set(partial);
    set({ settings: next, ready: true });
    applyOverlayVars(next);
  }
}));

export const useSettings = () => {
  const store = useSettingsStore();

  useEffect(() => {
    let alive = true;
    window.orion.settings.get().then((settings) => {
      if (!alive) return;
      useSettingsStore.setState({ settings, ready: true });
      applyOverlayVars(settings);
    });

    const listener = (settings: Settings) => {
      useSettingsStore.setState({ settings, ready: true });
      applyOverlayVars(settings);
    };

    window.orion.events.on('settings:changed', listener);
    return () => {
      alive = false;
      window.orion.events.off('settings:changed', listener);
    };
  }, []);

  return store;
};
