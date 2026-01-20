import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import { useOverlayStore } from '../../state/overlayStore';
import FabButton from './FabButton';
import ActionPanel from './ActionPanel';
import SearchOverlay from './SearchOverlay';
import SettingsOverlay from './SettingsOverlay';
import DiagnosticsLayer from './DiagnosticsLayer';
import { useSettings } from '../../state/settings';
import { clamp } from '../../../shared/settings';

interface Props {
  webviewStatus: string;
}

const OverlayRoot = ({ webviewStatus }: Props) => {
  const { 
    isPanelOpen, 
    isSearchOpen, 
    isSettingsOpen, 
    diagnosticsMode,
    openPanel,
    togglePanel, 
    closePanel,
    openSearch,
    closeSearch,
    openSettings,
    closeSettings,
    toggleDiagnostics
  } = useOverlayStore();

  const { settings } = useSettings();
  const fabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pad = clamp(settings.fab.padding, 8, 32);

  const handleHome = async () => {
    await window.orion.navigation.home();
    closePanel();
  };

  const handleBack = async () => {
    await window.orion.navigation.back();
    closePanel();
  };

  const handleForward = async () => {
    await window.orion.navigation.forward();
    closePanel();
  };

  const handleSearch = () => {
    closePanel();
    openSearch();
  };

  const handleSettings = () => {
    openSettings();
  };

  const handleRefresh = async () => {
    await window.orion.navigation.refresh();
    closePanel();
  };

  const handleSearchSubmit = async (query: string) => {
    await window.orion.navigation.search(query);
    closeSearch();
  };

  const focusFab = () => {
    requestAnimationFrame(() => fabRef.current?.focus());
  };

  useEffect(() => {
    if (!settings.ui.hotkeys) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleDiagnostics();
      }
      if (settings.ui.hotkeys) {
        if (e.altKey && e.key === 'ArrowLeft') {
          e.preventDefault();
          void handleBack();
        }
        if (e.altKey && e.key === 'ArrowRight') {
          e.preventDefault();
          void handleForward();
        }
        if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          handleSearch();
        }
        if (e.ctrlKey && !e.shiftKey && e.key === ',') {
          e.preventDefault();
          handleSettings();
        }
      }

      if (settings.ui.closeOnEsc && e.key === 'Escape') {
        if (isSearchOpen) {
          closeSearch();
          focusFab();
        } else if (isSettingsOpen) {
          closeSettings();
          focusFab();
        } else if (isPanelOpen) {
          closePanel();
          focusFab();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.ui, toggleDiagnostics, handleBack, handleForward, handleSearch, handleSettings, isSearchOpen, isSettingsOpen, isPanelOpen, closeSearch, closeSettings, closePanel]);

  useEffect(() => {
    if (isPanelOpen) {
      requestAnimationFrame(() => {
        const firstButton = panelRef.current?.querySelector('button');
        firstButton?.focus();
      });
    }
  }, [isPanelOpen]);

  const lastStatus = useRef<string | null>(null);
  useEffect(() => {
    if (!settings.ui.autoCloseOnNav) return;
    if (!isPanelOpen) {
      lastStatus.current = webviewStatus;
      return;
    }
    if (lastStatus.current && webviewStatus === 'loading' && webviewStatus !== lastStatus.current) {
      closePanel();
    }
    lastStatus.current = webviewStatus;
  }, [settings.ui.autoCloseOnNav, isPanelOpen, webviewStatus, closePanel]);

  return createPortal(
    <>
      <div className="pointer-events-none fixed inset-0 z-[2147483000]">
        {diagnosticsMode && <DiagnosticsLayer />}
        {isPanelOpen && settings.ui.closeOnOutside && (
          <button
            className="pointer-events-auto fixed inset-0 bg-transparent"
            aria-label="Close overlay"
            onClick={() => {
              closePanel();
              focusFab();
            }}
          />
        )}
        <div
          className="absolute flex flex-col items-end gap-3"
          style={{
            bottom: `calc(${pad}px + env(safe-area-inset-bottom, 0px))`,
            [settings.fab.position === 'right-bottom' ? 'right' : 'left']:
              `calc(${pad}px + env(${settings.fab.position === 'right-bottom' ? 'safe-area-inset-right' : 'safe-area-inset-left'}, 0px))`
          } as any}
        >
          {isPanelOpen && (
            <div ref={panelRef} className="pointer-events-auto flex flex-col items-end gap-1">
              <ActionPanel
                onHome={handleHome}
                onBack={handleBack}
                onForward={handleForward}
                onSearch={handleSearch}
                onSettings={handleSettings}
                onRefresh={handleRefresh}
                order={settings.fab.buttonOrder as any}
                tooltips={settings.fab.tooltips}
                fabSize={settings.fab.size}
              />
            </div>
          )}
          <FabButton
            ref={fabRef}
            active={isPanelOpen}
            onClick={togglePanel}
            onMouseEnter={settings.fab.hoverOpen ? openPanel : undefined}
            size={settings.fab.size}
            shape={settings.fab.shape}
            opacity={settings.fab.opacity}
            tooltips={settings.fab.tooltips}
          />
        </div>
      </div>
      {isSearchOpen && <SearchOverlay onClose={() => { closeSearch(); focusFab(); }} onSearch={handleSearchSubmit} />}
      {isSettingsOpen && <SettingsOverlay onClose={() => { closeSettings(); focusFab(); }} />}
    </>,
    document.body
  );
};

export default OverlayRoot;
