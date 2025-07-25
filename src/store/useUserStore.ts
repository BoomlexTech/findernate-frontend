// store/useUserStore.ts
import { create } from 'zustand';

// Simple JWT decoder (no verification, just for client-side user data)
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

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

// Helper function to get user from JWT
const getUserFromToken = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('token');
  if (!token) return null;

  const decoded = decodeJWT(token);
  if (!decoded) return null;

  // Map JWT payload to User type
  return {
    _id: decoded._id,
    fullName: decoded.fullName,
    email: decoded.email,
    username: decoded.username,
    isBusinessProfile: false, // Default value
    profileImageUrl: decoded.profileImageUrl || '', // Default empty string
  };
};

export const useUserStore = create<UserStore>()((set, get) => ({
  user: null,
  token: null,

  setUser: (userData) => set({ user: userData }),

  setToken: (token) => {
    set({ token });
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
        // Also set user data from token
        const userData = getUserFromToken();
        set({ user: userData });
      } else {
        localStorage.removeItem('token');
        set({ user: null });
      }
    }
  },

  updateUser: (fields) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...fields } : null,
    })),

  logout: () => {
    set({ user: null, token: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
}));

// Initialize store from localStorage on app start
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    const userData = getUserFromToken();
    useUserStore.setState({ user: userData, token });
  }
}
