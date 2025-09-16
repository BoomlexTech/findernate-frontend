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

// Check if JWT token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Treat invalid tokens as expired
  }
};

// Validate token and return if it's valid and not expired
const isValidToken = (token: string | null): boolean => {
  if (!token) return false;
  if (token.split('.').length !== 3) return false; // Basic JWT structure check
  return !isTokenExpired(token);
};

type User = {
  _id: string;
  fullName: string;
  email: string;
  username?: string;
  isBusinessProfile: boolean;
  profileImageUrl: string;
  avatar?: string;
  privacy?: 'public' | 'private';
  isPhoneNumberHidden?: boolean;
  isAddressHidden?: boolean;
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
  isTokenValid: () => boolean;
  validateAndGetToken: () => string | null;
  checkTokenExpiration: () => void;
};

// Helper function to get user from JWT with validation
const getUserFromToken = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('token');
  if (!token || !isValidToken(token)) {
    // Clean up invalid token
    if (token && !isValidToken(token)) {
      console.warn('Removing invalid/expired token from localStorage');
      localStorage.removeItem('token');
    }
    return null;
  }

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

export const useUserStore = create<UserStore>()((set) => ({
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

  // Check if current token is valid
  isTokenValid: () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    return isValidToken(token);
  },

  // Get token only if it's valid, otherwise clean up and return null
  validateAndGetToken: () => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('token');
    if (!token || !isValidToken(token)) {
      // Clean up invalid token and user data
      if (token) {
        console.warn('Token expired/invalid, logging out user');
        localStorage.removeItem('token');
        set({ user: null, token: null });
      }
      return null;
    }
    return token;
  },

  // Check token expiration and auto-logout if expired
  checkTokenExpiration: () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    if (token && !isValidToken(token)) {
      console.warn('Token expired, automatically logging out user');
      set({ user: null, token: null });
      localStorage.removeItem('token');
    }
  },
}));

// Initialize store from localStorage on app start with validation
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token && isValidToken(token)) {
    const userData = getUserFromToken();
    useUserStore.setState({ user: userData, token });
  } else if (token) {
    // Clean up invalid token
    console.warn('Invalid token found during initialization, cleaning up');
    localStorage.removeItem('token');
  }
}
