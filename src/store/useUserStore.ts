// store/useUserStore.ts
import { create } from 'zustand';

type User = {
  _id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  // Add other fields as needed
};

type UserStore = {
  user: User | null;
  setUser: (userData: User) => void;
  token: string | null;
  setToken: (token: string) => void;
  updateUser: (fields: Partial<User>) => void;
  clearUser?: () => void;
  logout: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token'): null,

  setUser: (userData) => set({ user: userData }),

    setToken: (token: string) => {
    localStorage.setItem('token', token);
    set({ token });
  },

  updateUser: (fields) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...fields } : null,
    })),

    logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
