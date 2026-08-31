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
  setLanguage: (language: AppLanguage) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  // Отдельный экшен от setUser: смена языка в профиле не должна ждать
  // перечитывания всего пользователя с сервера, чтобы весь UI-хром (useT())
  // подхватил новый язык сразу же, а не только после перезагрузки страницы.
  setLanguage: (language) =>
    set((state) => (state.user ? { user: { ...state.user, language } } : state)),
}));
