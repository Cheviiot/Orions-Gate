import type { OrionBridge } from '../../shared/api';
import type { WebviewTag } from 'electron';

declare global {
  interface Window {
    orion: OrionBridge;
  }

  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<React.HTMLAttributes<WebviewTag>, WebviewTag> & {
        src?: string;
        partition?: string;
        allowpopups?: boolean;
        preload?: string;
        useragent?: string;
      };
    }
  }
}

export {};
