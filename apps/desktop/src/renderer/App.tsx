import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import WebviewHost from './components/WebviewHost';
import OverlayRoot from './components/Overlay/OverlayRoot';
import { useSettings } from './state/settings';

const App = () => {
  const [webviewStatus, setWebviewStatus] = useState<string>('initializing');
  const { i18n } = useTranslation();
  const { settings } = useSettings();

  useEffect(() => {
    void i18n.changeLanguage(settings?.ui?.language ?? 'en');
  }, [settings?.ui?.language, i18n]);

  return (
    <div className="h-screen overflow-hidden bg-black">
      <WebviewHost src="https://www.youtube.com" onStatusChange={setWebviewStatus} />
      <OverlayRoot webviewStatus={webviewStatus} />
    </div>
  );
};

export default App;
