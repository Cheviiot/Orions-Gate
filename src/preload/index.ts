import { contextBridge, ipcRenderer, webFrame } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import type { OrionBridge } from '../shared/api';
import type { Settings } from '../shared/settings';

const api: OrionBridge = {
  platform: process.platform,
  appVersion: process.versions.electron,
  ping: () => ipcRenderer.invoke('ping'),
  navigation: {
    home: () => ipcRenderer.invoke('navigation:home'),
    back: () => ipcRenderer.invoke('navigation:back'),
    forward: () => ipcRenderer.invoke('navigation:forward'),
    search: (query: string) => ipcRenderer.invoke('navigation:search', query),
    refresh: () => ipcRenderer.invoke('navigation:refresh')
  },
  
  settings: {
    get: () => ipcRenderer.invoke('settings:get') as Promise<Settings>,
    set: (partial) => ipcRenderer.invoke('settings:set', partial) as Promise<Settings>
  },

  devtools: {
    openMain: () => ipcRenderer.invoke('devtools:open-main'),
    openWebview: () => ipcRenderer.invoke('devtools:open-webview')
  },

  events: {
    on: (channel, listener) => {
      const wrapped = (_event: Electron.IpcRendererEvent, ...args: any[]) => listener(...args);
      ipcRenderer.on(channel, wrapped);
      // store wrapped listener on original for later removal
      (listener as any).__orionWrapped = wrapped;
    },
    off: (channel, listener) => {
      const wrapped = (listener as any).__orionWrapped;
      if (wrapped) {
        ipcRenderer.removeListener(channel, wrapped);
        delete (listener as any).__orionWrapped;
      }
    }
  }
};

contextBridge.exposeInMainWorld('orion', api);

// ============================================================================
// VOT (Voice Over Translation) Integration
// ============================================================================

async function injectVOT() {
  console.log('[VOT] Preparing injection...');

  try {
    // Check URL in page world via executeJavaScript
    const currentUrl = await webFrame.executeJavaScript('window.location.href');
    const VOT_ENABLED_HOSTS = /^https?:\/\/(www\.)?youtube\.(com|ru)|youtu\.be/i;
    
    if (!VOT_ENABLED_HOSTS.test(currentUrl)) {
      console.log('[VOT] Skipped - not a YouTube domain:', currentUrl);
      return;
    }

    console.log('[VOT] Injecting into YouTube:', currentUrl);

    // Expose VOT Bridge to page world
    const votBridge = {
      storageDump: () => ipcRenderer.invoke('vot:storage:dump'),
      storageSet: (key: string, value: any) => ipcRenderer.invoke('vot:storage:set', key, value),
      storageDel: (key: string) => ipcRenderer.invoke('vot:storage:del', key),
      storageList: () => ipcRenderer.invoke('vot:storage:list'),
      http: (options: any) => ipcRenderer.invoke('vot:http', options),
      notify: (title: string, message: string) => ipcRenderer.invoke('vot:notify', title, message),
      download: (url: string, filename: string) => ipcRenderer.invoke('vot:download', url, filename),
    };

    contextBridge.exposeInMainWorld('__votBridge', votBridge);

    // Load GM-Shim code and inject into page world
    const gmShimCode = `
      (function() {
        const bridge = window.__votBridge;
        if (!bridge) {
          console.error('[VOT GM-Shim] Bridge not available');
          return;
        }

        // Storage cache (synced from main process)
        let storageCache = {};

        // Initialize storage cache from main process
        async function initStorageCache() {
          try {
            storageCache = await bridge.storageDump();
            console.log('[VOT GM-Shim] Storage cache initialized');
          } catch (error) {
            console.error('[VOT GM-Shim] Failed to initialize storage cache:', error);
          }
        }

        // GM_getValue - synchronous, uses local cache
        window.GM_getValue = function(key, defaultValue) {
          if (key in storageCache) {
            return storageCache[key];
          }
          return defaultValue;
        };

        // GM_setValue - asynchronous, updates main process
        window.GM_setValue = async function(key, value) {
          storageCache[key] = value;
          if (bridge) {
            try {
              await bridge.storageSet(key, value);
              console.log('[VOT GM-Shim] Storage set: ' + key);
            } catch (error) {
              console.error('[VOT GM-Shim] Failed to set ' + key + ':', error);
            }
          }
        };

        // GM_deleteValue - deletes value from storage
        window.GM_deleteValue = async function(key) {
          delete storageCache[key];
          if (bridge) {
            try {
              await bridge.storageDel(key);
              console.log('[VOT GM-Shim] Storage deleted: ' + key);
            } catch (error) {
              console.error('[VOT GM-Shim] Failed to delete ' + key + ':', error);
            }
          }
        };

        // GM_listValues - lists all storage keys
        window.GM_listValues = async function() {
          if (bridge) {
            try {
              return await bridge.storageList();
            } catch (error) {
              console.error('[VOT GM-Shim] Failed to list values:', error);
              return [];
            }
          }
          return Object.keys(storageCache);
        };

        // GM_xmlhttpRequest - XHR without CORS
        window.GM_xmlhttpRequest = function(options) {
          const { method = 'GET', url, headers = {}, data, responseType = 'text', onload, onerror } = options;

          if (!bridge) {
            console.error('[VOT GM-Shim] Bridge not available for HTTP request');
            if (onerror) {
              onerror({ status: 0, statusText: 'No bridge available', response: null, responseText: '' });
            }
            return;
          }

          bridge.http({ method, url, headers, body: data, responseType })
            .then(function(response) {
              console.log('[VOT GM-Shim] HTTP ' + method + ' ' + url + ' -> ' + response.status);
              if (onload) {
                onload({
                  status: response.status,
                  statusText: response.statusText,
                  responseHeaders: response.responseHeaders || '',
                  response: response.response,
                  responseText: response.responseText || '',
                  finalUrl: response.finalUrl || url,
                });
              }
            })
            .catch(function(error) {
              console.error('[VOT GM-Shim] HTTP error: ' + error.message);
              if (onerror) {
                onerror({ status: 0, statusText: 'Network Error', response: null, responseText: error.message });
              }
            });
        };

        // GM_addStyle - adds CSS to page
        window.GM_addStyle = function(css) {
          const style = document.createElement('style');
          style.textContent = css;
          document.head.appendChild(style);
          return style;
        };

        // GM_notification - shows notification
        window.GM_notification = async function(options) {
          const title = options.title || 'VOT';
          const text = options.text || options.message || '';
          if (bridge) {
            try {
              await bridge.notify(title, text);
            } catch (error) {
              console.error('[VOT GM-Shim] Notification error:', error);
            }
          }
        };

        // GM_download - downloads file
        window.GM_download = async function(options) {
          const url = options.url || options;
          const filename = options.name || options.filename || 'download';
          if (bridge) {
            try {
              await bridge.download(url, filename);
            } catch (error) {
              console.error('[VOT GM-Shim] Download error:', error);
            }
          }
        };

        // GM_info - script info
        window.GM_info = {
          scriptMetaStr: '',
          scriptHandler: 'Electron',
          version: '1.0.0',
          script: {
            author: 'Orion\\'s Gate Team',
            copyright: 'Copyright © 2026',
            description: 'VOT Integration in Electron',
            excludes: [],
            homepage: '',
            icon: '',
            icon64: '',
            includes: ['https://*.youtube.com/*', 'https://youtu.be/*'],
            matches: ['https://*.youtube.com/*', 'https://youtu.be/*'],
            name: 'Voice Over Translation',
            namespace: 'vot.toil.cc',
            resources: {},
            run_at: 'document_start',
            supportURL: '',
            version: '1.0.0',
            downloadURL: '',
            updateURL: '',
            grant: [],
          },
        };

        // unsafeWindow - direct reference to window
        window.unsafeWindow = window;

        // Initialize storage cache
        initStorageCache();
        console.log('[VOT GM-Shim] Initialized');
      })();
    `;

    // Execute GM-Shim in page world
    await webFrame.executeJavaScript(gmShimCode);

    // Load dependencies in order
    const dependencies = [
      'hls.light.min.js',
      'gm-addstyle-polyfill.js',
    ];

    for (const depFile of dependencies) {
      const depPath = path.join(__dirname, `../../assets/vot/${depFile}`);
      try {
        const depCode = fs.readFileSync(depPath, 'utf8');
        await webFrame.executeJavaScript(depCode);
        console.log(`[VOT] Loaded dependency: ${depFile}`);
      } catch (error) {
        console.warn(`[VOT] Failed to load ${depFile}:`, error);
      }
    }

    // Load and execute VOT userscript
    const votPath = path.join(__dirname, '../../assets/vot/vot.user.js');
    const votCode = fs.readFileSync(votPath, 'utf8');
    
    // Extract the actual code (remove metadata block)
    const codeMatch = votCode.match(/\/\/\s*==/);
    const startIdx = codeMatch ? votCode.indexOf('\n', codeMatch.index) : 0;
    const actualCode = votCode.substring(startIdx).replace(/^\/\/ @\w+.*$/gm, '');

    await webFrame.executeJavaScript(actualCode);
    console.log('[VOT] Loaded successfully');

  } catch (error) {
    console.error('[VOT] Injection failed:', error);
  }
}

// Inject VOT on page load
// Use setTimeout to ensure page context is ready
setTimeout(() => {
  injectVOT().catch(err => console.error('[VOT] Delayed injection failed:', err));
}, 100);
