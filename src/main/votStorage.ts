import Store from 'electron-store';
import path from 'node:path';
import { app } from 'electron';

interface VOTStorageSchema {
  [key: string]: any;
}

class VOTStorage {
  private store: Store<VOTStorageSchema>;

  constructor() {
    this.store = new Store<VOTStorageSchema>({
      name: 'vot-storage',
      cwd: path.join(app.getPath('userData'), 'vot-data'),
      serialize: (value: any) => JSON.stringify(value),
      deserialize: (text: string) => JSON.parse(text),
    });
  }

  /**
   * Get all stored values
   */
  dump(): Record<string, any> {
    return (this.store as any).store || {};
  }

  /**
   * Get a single value
   */
  get(key: string): any {
    return (this.store as any).get?.(key);
  }

  /**
   * Set a single value
   */
  set(key: string, value: any): void {
    (this.store as any).set?.(key, value);
  }

  /**
   * Delete a single value
   */
  delete(key: string): void {
    (this.store as any).delete?.(key);
  }

  /**
   * List all keys
   */
  listKeys(): string[] {
    return Object.keys((this.store as any).store || {});
  }
}

export const votStorage = new VOTStorage();
