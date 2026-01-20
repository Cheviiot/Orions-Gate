import { net, session, ipcMain, BrowserWindow, app } from 'electron';
import { votStorage } from './votStorage';
import fs from 'node:fs';
import path from 'node:path';

export function initVOTBridge() {
  /**
   * VOT: Get file content (for preload scripts)
   */
  ipcMain.handle('vot:get-file', async (_event, filename: string) => {
    console.log(`[VOT] Get file requested: ${filename}`);
    try {
      const filePath = path.join(__dirname, '../assets/vot', filename);
      const content = fs.readFileSync(filePath, 'utf8');
      return content;
    } catch (error: any) {
      console.error(`[VOT] Failed to read file ${filename}:`, error);
      throw error;
    }
  });

  /**
   * Storage: dump all values
   */
  ipcMain.handle('vot:storage:dump', async () => {
    console.log('[VOT] Storage dump requested');
    return votStorage.dump();
  });

  /**
   * Storage: set value
   */
  ipcMain.handle('vot:storage:set', async (_event, key: string, value: any) => {
    console.log(`[VOT] Storage set: ${key}`);
    votStorage.set(key, value);
  });

  /**
   * Storage: delete value
   */
  ipcMain.handle('vot:storage:del', async (_event, key: string) => {
    console.log(`[VOT] Storage delete: ${key}`);
    votStorage.delete(key);
  });

  /**
   * Storage: list keys
   */
  ipcMain.handle('vot:storage:list', async () => {
    console.log('[VOT] Storage list requested');
    return votStorage.listKeys();
  });

  /**
   * HTTP requests without CORS
   */
  ipcMain.handle('vot:http', async (
    _event,
    options: {
      method?: string;
      url: string;
      headers?: Record<string, string>;
      body?: string;
      responseType?: 'text' | 'arraybuffer' | 'json';
    }
  ) => {
    const {
      method = 'GET',
      url,
      headers = {},
      body,
      responseType = 'text',
    } = options;

    try {
      console.log(`[VOT] HTTP ${method}: ${url}`);

      const request = net.request({
        method,
        url,
        headers,
      });

      return new Promise((resolve, reject) => {
        let responseData = '';
        const responseHeaders: Record<string, string> = {};

        request.on('response', (response) => {
          // Collect response headers
          Object.entries(response.headers).forEach(([key, value]) => {
            responseHeaders[key] = Array.isArray(value) ? value[0] : value;
          });

          if (responseType === 'arraybuffer') {
            // Binary data
            const chunks: Buffer[] = [];
            response.on('data', (chunk) => {
              chunks.push(Buffer.from(chunk));
            });
            response.on('end', () => {
              const buffer = Buffer.concat(chunks);
              resolve({
                status: response.statusCode || 200,
                statusText: response.statusMessage || 'OK',
                responseHeaders,
                response: buffer.toString('latin1'),
                responseText: buffer.toString('latin1'),
                finalUrl: url,
              });
            });
          } else {
            // Text/JSON
            response.on('data', (chunk) => {
              responseData += chunk.toString();
            });
            response.on('end', () => {
              resolve({
                status: response.statusCode || 200,
                statusText: response.statusMessage || 'OK',
                responseHeaders,
                response: responseType === 'json' ? JSON.parse(responseData) : responseData,
                responseText: responseData,
                finalUrl: url,
              });
            });
          }
        });

        request.on('error', (error) => {
          console.error(`[VOT] HTTP error: ${error.message}`);
          reject({
            status: 0,
            statusText: 'Network Error',
            response: error.message,
            responseText: error.message,
            finalUrl: url,
          });
        });

        if (body) {
          request.write(body);
        }
        request.end();
      });
    } catch (error: any) {
      console.error(`[VOT] HTTP error: ${error.message}`);
      return {
        status: 0,
        statusText: 'Error',
        response: error.message,
        responseText: error.message,
        finalUrl: url,
      };
    }
  });

  /**
   * Notification
   */
  ipcMain.handle('vot:notify', async (_event, title: string, message: string) => {
    console.log(`[VOT] Notification: ${title} - ${message}`);
    // Используем встроенный Notification API (если доступен в Electron)
    // Или отправляем уведомление в главное окно
    try {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow) {
        mainWindow.webContents.send('vot:notification', { title, message });
      }
    } catch (error) {
      console.error('[VOT] Notification error:', error);
    }
  });

  /**
   * Download file
   */
  ipcMain.handle('vot:download', async (
    _event,
    url: string,
    filename: string
  ) => {
    console.log(`[VOT] Download requested: ${filename}`);
    try {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (!mainWindow) throw new Error('No main window found');

      // Используем встроенный will-download событие
      mainWindow.webContents.downloadURL(url);
      return { success: true };
    } catch (error: any) {
      console.error(`[VOT] Download error: ${error.message}`);
      return { success: false, error: error.message };
    }
  });

  console.log('[VOT] Bridge initialized');
}
