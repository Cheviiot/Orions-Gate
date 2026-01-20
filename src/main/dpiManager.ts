import type { Settings } from '../shared/settings';
import path from 'node:path';

export class Logger {
  static debug(...args: any[]) {
    console.debug('[demergi]', ...args);
  }
  static info(...args: any[]) {
    console.info('[demergi]', ...args);
  }
  static warn(...args: any[]) {
    console.warn('[demergi]', ...args);
  }
  static error(...args: any[]) {
    console.error('[demergi]', ...args);
  }
}

// Manages the lifecycle of demergi proxy
type DpiConfig = NonNullable<Settings['dpi']>;

type DpiState = {
  isRunning: boolean;
  currentMode: DpiConfig['mode'];
  currentPort: number | null;
};

const state: DpiState = {
  isRunning: false,
  currentMode: 'off',
  currentPort: null
};

export const stopDpiProcess = async () => {
  if (!state.isRunning) return;

  // Demergi runs in the same process, stopping requires process restart
  // Just mark as stopped for now
  state.isRunning = false;
  state.currentPort = null;
  state.currentMode = 'off';
  Logger.info('Demergi marked as stopped (requires app restart to fully stop)');
};

export const ensureDemergi = async (dpi: DpiConfig): Promise<boolean> => {
  // Only manage proxy for demergi mode and when autoStart is enabled
  if (dpi.mode !== 'demergi' || dpi.autoStart === false) {
    await stopDpiProcess();
    return false;
  }

  // Check if already running with desired config
  if (state.isRunning && state.currentMode === 'demergi' && state.currentPort === dpi.port) {
    Logger.debug(`Demergi already running on port ${dpi.port}, skipping`);
    return true; // already running with desired config
  }

  if (state.isRunning) {
    Logger.warn('Demergi already running, cannot change config without restart');
    return true; // Return true to avoid breaking the flow
  }

  try {
    // Set demergi configuration via environment variables
    // Format: [::]:port for IPv6+IPv4 or 127.0.0.1:port for IPv4 only
    process.env.DEMERGI_ADDRS = `[::]:${dpi.port}`;
    
    // IMPORTANT: Do NOT set DEMERGI_HOSTS - leaving it undefined applies to ALL hosts
    // This is how youtube-dpi-free does it - demergi will handle all traffic through proxy
    // The app.commandLine.appendSwitch('proxy-server') ensures only app traffic goes through it
    
    // Configure demergi parameters (using youtube-dpi-free compatible settings)
    process.env.DEMERGI_LOG_LEVEL = 'info';
    process.env.DEMERGI_HTTPS_CLIENTHELLO_SIZE = '40'; // Fragment TLS ClientHello
    process.env.DEMERGI_HTTP_MIX_HOST_HEADER_CASE = 'true';
    
    // Load demergi.js - it will start automatically
    const demergiPath = path.join(__dirname, 'demergi.js');
    Logger.info(`Starting demergi (v2.2.2) from: ${demergiPath}`);
    Logger.info(`Demergi config: addr=[::]:${dpi.port}, applies to ALL hosts`);
    
    require(demergiPath);

    state.isRunning = true;
    state.currentMode = 'demergi';
    state.currentPort = dpi.port;
    
    Logger.info(`Demergi started on port ${dpi.port}`);
    return true;
  } catch (err) {
    Logger.error('Failed to start demergi:', err);
    await stopDpiProcess();
    return false;
  }
};

export const getDpiState = () => ({
  running: Boolean(state.isRunning),
  mode: state.currentMode,
  port: state.currentPort
});
