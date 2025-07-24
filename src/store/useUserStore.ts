// store/useUserStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  _id: string;
  fullName: string;
  email: string;
  username?: string;
  isBusinessProfile: boolean;
  profileImageUrl: string;
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

export const useUserStore = create<UserStore>()(
  persist(
    (set ) => ({
      user: null,
      token: null,

      setUser: (userData) => set({ user: userData }),

      setToken: (token) => set({ token }),

      updateUser: (fields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...fields } : null,
        })),

      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'user-storage', // 🔐 key for localStorage
      partialize: (state) => ({ user: state.user, token: state.token }), // optional: only store user & token
    }
  )
);
