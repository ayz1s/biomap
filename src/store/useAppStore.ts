import { create } from "zustand";

export type AppLanguage = "RU" | "UZ";

export interface AppUser {
  id: string;
  telegramId: string;
  firstName: string;
  username?: string | null;
  language: AppLanguage;
}

interface AppState {
  user: AppUser | null;
  setUser: (user: AppUser) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
