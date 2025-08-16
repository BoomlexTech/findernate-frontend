// Push Notification Utilities
import { messageAPI } from '../api/message';

// VAPID public key - replace with your actual VAPID key
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export interface NotificationPermissionState {
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  supported: boolean;
}

export interface MessageNotificationData {
  title: string;
  body: string;
  chatId: string;
  messageId: string;
  senderId: string;
  senderName: string;
  url?: string;
  icon?: string;
}

class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null;

  // Check if push notifications are supported
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  // Get current notification permission state
  async getPermissionState(): Promise<NotificationPermissionState> {
    if (!this.isSupported()) {
      return {
        permission: 'denied',
        subscription: null,
        supported: false
      };
    }

    const permission = Notification.permission;
    let subscription: PushSubscription | null = null;

    try {
      const registration = await this.getServiceWorkerRegistration();
      if (registration) {
        subscription = await registration.pushManager.getSubscription();
      }
    } catch (error) {
      console.error('Error getting push subscription:', error);
    }

    return {
      permission,
      subscription,
      supported: true
    };
  }

  // Register service worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      console.warn('Service workers are not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', registration);

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              console.log('New service worker available');
              // You can show a notification to user to refresh
            }
          });
        }
      });

      this.registration = registration;
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  // Get service worker registration
  async getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (this.registration) {
      return this.registration;
    }

    if (!this.isSupported()) {
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      return this.registration;
    } catch (error) {
      console.error('Error getting service worker registration:', error);
      return null;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    // Request permission
    const permission = await Notification.requestPermission();
    return permission;
  }

  // Subscribe to push notifications
  async subscribe(): Promise<PushSubscription | null> {
    try {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.log('Push notification permission denied');
        return null;
      }

      // Check if VAPID key is available
      if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.length === 0) {
        console.error('VAPID public key is not configured. Please add NEXT_PUBLIC_VAPID_PUBLIC_KEY to your environment variables.');
        throw new Error('Push notifications are not configured on this server. Please contact support.');
      }

      const registration = await this.getServiceWorkerRegistration();
      if (!registration) {
        console.error('No service worker registration available');
        return null;
      }

      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      }

      console.log('Push subscription successful:', subscription);

      // Send subscription to backend (optional - won't fail if backend not ready)
      try {
        await this.sendSubscriptionToBackend(subscription);
      } catch (backendError) {
        console.warn('Could not sync subscription with backend (this is expected if backend endpoints are not implemented yet):', backendError);
        // Don't throw error - local subscription still works
      }

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      if (error instanceof Error && error.message.includes('atob')) {
        throw new Error('Invalid VAPID key configuration. Please check server settings.');
      }
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    try {
      const registration = await this.getServiceWorkerRegistration();
      if (!registration) {
        return false;
      }

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        return true; // Already unsubscribed
      }

      // Unsubscribe
      const result = await subscription.unsubscribe();
      
      if (result) {
        // Remove subscription from backend (optional)
        try {
          await this.removeSubscriptionFromBackend(subscription);
        } catch (backendError) {
          console.warn('Could not remove subscription from backend:', backendError);
          // Don't throw error - local unsubscribe still worked
        }
        console.log('Successfully unsubscribed from push notifications');
      }

      return result;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  // Send subscription to backend
  private async sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://thedashman.org';
      const response = await fetch(`${baseUrl}/api/v1/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to backend');
      }

      console.log('Subscription sent to backend successfully');
    } catch (error) {
      console.error('Error sending subscription to backend:', error);
      // Don't throw error as local subscription still works
    }
  }

  // Remove subscription from backend
  private async removeSubscriptionFromBackend(subscription: PushSubscription): Promise<void> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://thedashman.org';
      const response = await fetch(`${baseUrl}/api/v1/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from backend');
      }

      console.log('Subscription removed from backend successfully');
    } catch (error) {
      console.error('Error removing subscription from backend:', error);
    }
  }

  // Show local notification (for testing or immediate feedback)
  showLocalNotification(data: MessageNotificationData): void {
    if (!this.isSupported()) {
      console.warn('Cannot show local notification - not supported in this browser');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Cannot show local notification - permission not granted. Current permission:', Notification.permission);
      return;
    }

    console.log('Showing local notification:', data.title);

    try {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/Findernate.ico',
        badge: '/Findernate.ico',
        tag: `message-${data.messageId}`,
        requireInteraction: true,
        data: {
          chatId: data.chatId,
          messageId: data.messageId,
          senderId: data.senderId,
          url: data.url || '/messages'
        }
      });

      notification.onclick = () => {
        console.log('Notification clicked, navigating to:', data.url || `/chats?chatId=${data.chatId}`);
        window.focus();
        const url = data.url || `/chats?chatId=${data.chatId}`;
        window.location.href = url;
        notification.close();
      };

      notification.onerror = (error) => {
        console.error('Notification error:', error);
      };

      notification.onshow = () => {
        console.log('Notification shown successfully');
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  // Convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    try {
      // Validate input
      if (!base64String || typeof base64String !== 'string') {
        throw new Error('Invalid VAPID key: empty or invalid string');
      }

      // Remove any whitespace
      const cleanBase64 = base64String.trim();
      
      // Add padding if needed
      const padding = '='.repeat((4 - cleanBase64.length % 4) % 4);
      const base64 = (cleanBase64 + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      // Validate base64 format
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(base64)) {
        throw new Error('Invalid VAPID key format');
      }

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    } catch (error) {
      console.error('Error converting VAPID key:', error);
      throw new Error('Invalid VAPID key configuration');
    }
  }

  // Listen for service worker messages
  setupMessageListener(): void {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
        const data = event.data.data;
        
        // Navigate to the specific chat
        if (data.chatId) {
          window.location.href = `/chats?chatId=${data.chatId}`;
        } else {
          window.location.href = '/chats';
        }
      }
    });
  }
}

// Create singleton instance
export const pushNotificationManager = new PushNotificationManager();

// Initialize push notifications
export async function initializePushNotifications(): Promise<NotificationPermissionState> {
  try {
    // Register service worker
    await pushNotificationManager.registerServiceWorker();
    
    // Set up message listener
    pushNotificationManager.setupMessageListener();
    
    // Get current state
    const state = await pushNotificationManager.getPermissionState();
    
    // Only auto-subscribe if permission is already granted AND VAPID key is configured
    if (state.permission === 'granted' && !state.subscription && VAPID_PUBLIC_KEY) {
      try {
        await pushNotificationManager.subscribe();
      } catch (subscriptionError) {
        console.error('Auto-subscription failed:', subscriptionError);
        // Don't throw error here, just log it - the state is still valid
      }
    }
    
    return state;
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return {
      permission: 'denied',
      subscription: null,
      supported: false
    };
  }
}

// Helper function to create notification from message
export function createMessageNotification(message: any, senderName: string): MessageNotificationData {
  return {
    title: `New message from ${senderName}`,
    body: message.messageType === 'text' 
      ? message.message 
      : `Sent ${message.messageType === 'image' ? 'an image' : message.messageType === 'video' ? 'a video' : 'a file'}`,
    chatId: message.chatId,
    messageId: message._id,
    senderId: message.sender._id,
    senderName: senderName,
    url: `/chats?chatId=${message.chatId}`,
    icon: '/icon-192x192.png'
  };
}