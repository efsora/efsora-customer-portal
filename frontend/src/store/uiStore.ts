import { create } from 'zustand';

export interface UIState {
    // Slide Panel state
    isSlidePanelOpen: boolean;
    setSlidePanelOpen: (isOpen: boolean) => void;
    toggleSlidePanel: () => void;
}

/**
 * Zustand UI store for managing UI state like slide panels
 */
export const useUIStore = create<UIState>((set, get) => ({
    isSlidePanelOpen: false,

    setSlidePanelOpen: (isOpen: boolean) => {
        set({ isSlidePanelOpen: isOpen });
    },

    toggleSlidePanel: () => {
        set({ isSlidePanelOpen: !get().isSlidePanelOpen });
    },
}));
