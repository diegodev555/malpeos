import { create } from "zustand";

interface AppState {
  /** Whether the app is initializing / checking auth */
  isReady: boolean;
  setReady: (ready: boolean) => void;

  /** Active sidebar / menu open state (mobile drawer) */
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isReady: false,
  setReady: (isReady) => set({ isReady }),

  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));