import { io, Socket } from 'socket.io-client';
import { Message } from '@/api/message';

class SocketManager {
  private socket: Socket | null = null;
  private isConnected = false;
  private eventListeners: Map<string, Function[]> = new Map();

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    const serverUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    
    this.socket = io(serverUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
      this.emit('connection_status', { connected: false });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.emit('connection_error', error);
    });

    // Message events
    this.socket.on('new_message', (data: { chatId: string; message: Message }) => {
      this.emit('new_message', data);
    });

    this.socket.on('messages_read', (data: { chatId: string; readBy: any; messageIds?: string[] }) => {
      this.emit('messages_read', data);
    });

    this.socket.on('message_deleted', (data: { chatId: string; messageId: string; deletedBy: any }) => {
      this.emit('message_deleted', data);
    });

    this.socket.on('message_restored', (data: { chatId: string; messageId: string; restoredMessage: Message; restoredBy: any }) => {
      this.emit('message_restored', data);
    });

    // Typing events
    this.socket.on('user_typing', (data: { userId: string; username: string; fullName: string; chatId: string }) => {
      this.emit('user_typing', data);
    });

    this.socket.on('user_stopped_typing', (data: { userId: string; chatId: string }) => {
      this.emit('user_stopped_typing', data);
    });

    // Online status events
    this.socket.on('user_status_changed', (data: { userId: string; status: string; timestamp: string }) => {
      this.emit('user_status_changed', data);
    });

    this.socket.on('user_offline', (data: { userId: string; timestamp: string }) => {
      this.emit('user_offline', data);
    });
  }

  // Join a chat room
  joinChat(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_chat', chatId);
    }
  }

  // Leave a chat room
  leaveChat(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_chat', chatId);
    }
  }

  // Send a message through socket (for immediate UI update)
  sendMessage(chatId: string, message: string, messageType = 'text', replyTo?: string) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', {
        chatId,
        message,
        messageType,
        replyTo
      });
    }
  }

  // Start typing
  startTyping(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { chatId });
    }
  }

  // Stop typing
  stopTyping(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { chatId });
    }
  }

  // Mark messages as read
  markRead(chatId: string, messageIds?: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('mark_read', { chatId, messageIds });
    }
  }

  // Delete message
  deleteMessage(chatId: string, messageId: string) {
    if (this.socket?.connected) {
      this.socket.emit('delete_message', { chatId, messageId });
    }
  }

  // Restore message
  restoreMessage(chatId: string, messageId: string, restoredMessage: Message) {
    if (this.socket?.connected) {
      this.socket.emit('restore_message', { chatId, messageId, restoredMessage });
    }
  }

  // Set online status
  setOnlineStatus(status: string) {
    if (this.socket?.connected) {
      this.socket.emit('set_online_status', status);
    }
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.eventListeners.delete(event);
      return;
    }

    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

// Export singleton instance
export const socketManager = new SocketManager();
export default socketManager;