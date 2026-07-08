import { create } from "zustand";

export interface AppUser {
  id: string;
  telegramId: string;
  firstName: string;
  username?: string | null;
}

interface AppState {
  user: AppUser | null;
  setUser: (user: AppUser) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
