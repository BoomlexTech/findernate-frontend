import { create } from 'zustand';
import { AdminUser, Notification } from '@/types/admin';

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AdminUser) => void;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, '_id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

interface AdminStore extends AuthState, NotificationState, UIState {}

export const useAdminStore = create<AdminStore>((set, get) => ({
  // Auth State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // Mock login - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: AdminUser = {
        _id: '1',
        username: 'admin',
        fullName: 'Admin User',
        email: email,
        role: 'super_admin',
        profileImageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        lastActive: new Date().toISOString(),
      };
      
      set({ 
        user: mockUser, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: () => {
    set({ 
      user: null, 
      isAuthenticated: false,
      notifications: [],
      unreadCount: 0
    });
  },
  
  setUser: (user: AdminUser) => {
    set({ user, isAuthenticated: true });
  },
  
  // Notification State
  notifications: [],
  unreadCount: 0,
  
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    set(state => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
  
  markAsRead: (id: string) => {
    set(state => ({
      notifications: state.notifications.map(notif =>
        notif._id === id ? { ...notif, isRead: true } : notif
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },
  
  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(notif => ({ ...notif, isRead: true })),
      unreadCount: 0,
    }));
  },
  
  removeNotification: (id: string) => {
    set(state => ({
      notifications: state.notifications.filter(notif => notif._id !== id),
      unreadCount: state.notifications.find(n => n._id === id)?.isRead ? state.unreadCount : Math.max(0, state.unreadCount - 1),
    }));
  },
  
  // UI State
  sidebarCollapsed: false,
  
  toggleSidebar: () => {
    set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },
  
  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed });
  },
}));