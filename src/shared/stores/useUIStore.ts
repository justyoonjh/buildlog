import { create } from 'zustand';

interface UIStore {
  isProfileOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;

  isCompanyInfoOpen: boolean;
  openCompanyInfo: () => void;
  closeCompanyInfo: () => void;

  isBusinessInfoOpen: boolean;
  openBusinessInfo: () => void;
  closeBusinessInfo: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isProfileOpen: false,
  openProfile: () => set({ isProfileOpen: true }),
  closeProfile: () => set({ isProfileOpen: false }),

  isCompanyInfoOpen: false,
  openCompanyInfo: () => set({ isCompanyInfoOpen: true }),
  closeCompanyInfo: () => set({ isCompanyInfoOpen: false }),

  isBusinessInfoOpen: false,
  openBusinessInfo: () => set({ isBusinessInfoOpen: true }),
  closeBusinessInfo: () => set({ isBusinessInfoOpen: false }),
}));
