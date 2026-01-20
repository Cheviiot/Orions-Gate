import type { Settings } from './settings';

export type OrionBridge = {
  platform: NodeJS.Platform;
  appVersion: string;
  ping: () => Promise<string>;
  navigation: {
    home: () => Promise<void>;
    back: () => Promise<void>;
    forward: () => Promise<void>;
    search: (query: string) => Promise<void>;
    refresh: () => Promise<void>;
  };
  settings: {
    get: () => Promise<Settings>;
    set: (partial: Partial<Settings>) => Promise<Settings>;
  };
  userscripts: {
    openSettings: () => Promise<boolean>;
  };
  devtools: {
    openMain: () => Promise<boolean>;
    openWebview: () => Promise<boolean>;
  };
  events: {
    on: (
      channel: 'webview:navigate' | 'webview:back' | 'webview:forward' | 'webview:refresh' | 'settings:changed' | 'adblocker:stats',
      listener: (...args: any[]) => void
    ) => void;
    off: (
      channel: 'webview:navigate' | 'webview:back' | 'webview:forward' | 'webview:refresh' | 'settings:changed' | 'adblocker:stats',
      listener: (...args: any[]) => void
    ) => void;
  };
};
