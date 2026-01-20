import { create } from 'zustand';

interface OverlayState {
  isPanelOpen: boolean;
  isSearchOpen: boolean;
  isSettingsOpen: boolean;
  diagnosticsMode: boolean;
  openPanel: () => void;
  togglePanel: () => void;
  closePanel: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  toggleDiagnostics: () => void;
}

export const useOverlayStore = create<OverlayState>((set) => ({
  isPanelOpen: false,
  isSearchOpen: false,
  isSettingsOpen: false,
  diagnosticsMode: false,
  openPanel: () => set({ isPanelOpen: true }),
  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
  closePanel: () => set({ isPanelOpen: false }),
  openSearch: () => set({ isSearchOpen: true, isPanelOpen: false }),
  closeSearch: () => set({ isSearchOpen: false }),
  openSettings: () => set({ isSettingsOpen: true, isPanelOpen: false }),
  closeSettings: () => set({ isSettingsOpen: false }),
  toggleDiagnostics: () => set((s) => ({ diagnosticsMode: !s.diagnosticsMode }))
}));
