// store/useUserStore.ts
import { create } from 'zustand';

type User = {
  _id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  token?: string; // Optional: if you store JWT
  // Add other fields as needed
};

type UserStore = {
  user: User | null;
  setUser: (userData: User) => void;
  updateUser: (fields: Partial<User>) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (userData) => set({ user: userData }),
  updateUser: (fields) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...fields } : null,
    })),
  clearUser: () => set({ user: null }),
}));
