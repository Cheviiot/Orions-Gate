import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../state/settings';
import type { WebviewTag } from 'electron';

type Props = {
  src: string;
  onStatusChange?: (status: string) => void;
};

const PARTITION = 'persist:orion-youtube';

const WebviewHost = ({ src, onStatusChange }: Props) => {
  const ref = useRef<WebviewTag>(null);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    const view = ref.current;
    if (!view) return;

    const handleDomReady = () => {
      onStatusChange?.('dom-ready');
    };
    const handleDidFinishLoad = () => {
      setError(null);
      onStatusChange?.('loaded');
    };
    const handleFail = (_event: any, errorCode: number, errorDescription: string) => {
      const errMsg = `${errorCode}: ${errorDescription}`;
      setError(errMsg);
      onStatusChange?.(`failed: ${errMsg}`);
    };
    const handleIPC = (event: Electron.IpcMessageEvent) => {
      if (event.channel === 'orion:webview-ready') {
        onStatusChange?.('guest-ready');
      }
    };

    view.addEventListener('dom-ready', handleDomReady);
    view.addEventListener('did-finish-load', handleDidFinishLoad);
    view.addEventListener('did-fail-load', handleFail as any);
    view.addEventListener('ipc-message', handleIPC as any);

    onStatusChange?.('loading');

    const navigateHandler = (url: string) => {
      if (view) view.src = url;
    };
    const backHandler = () => {
      if (view && view.canGoBack()) view.goBack();
    };
    const forwardHandler = () => {
      if (view && view.canGoForward()) view.goForward();
    };
    const refreshHandler = () => {
      if (view) {
        console.log('[WebviewHost] Reloading webview');
        view.reloadIgnoringCache();
      }
    };

    window.orion.events.on('webview:navigate', navigateHandler);
    window.orion.events.on('webview:back', backHandler);
    window.orion.events.on('webview:forward', forwardHandler);
    window.orion.events.on('webview:refresh', refreshHandler);

    return () => {
      view.removeEventListener('dom-ready', handleDomReady);
      view.removeEventListener('did-finish-load', handleDidFinishLoad);
      view.removeEventListener('did-fail-load', handleFail as any);
      view.removeEventListener('ipc-message', handleIPC as any);
      window.orion.events.off('webview:navigate', navigateHandler);
      window.orion.events.off('webview:back', backHandler);
      window.orion.events.off('webview:forward', forwardHandler);
      window.orion.events.off('webview:refresh', refreshHandler);
    };
  }, [onStatusChange]);


  return (
    <>
      <webview
        ref={ref}
        src={src}
        partition={PARTITION}
        allowpopups={false}
        style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
        className="absolute inset-0"
      />

    </>
  );
};

export default WebviewHost;
