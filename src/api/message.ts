import axiosInstance from './base';

// Types for API responses
export interface Message {
  _id: string;
  chatId: string;
  sender: {
    _id: string;
    username: string;
    fullName: string;
    profileImageUrl?: string;
  };
  message: string;
  messageType: 'text' | 'image' | 'video' | 'file' | 'audio' | 'location';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  replyTo?: string;
  timestamp: string;
  readBy: string[];
  isDeleted: boolean;
  deletedAt?: string;
  editedAt?: string;
  reactions: Array<{
    user: string;
    emoji: string;
    timestamp: string;
  }>;
}

export interface Chat {
  _id: string;
  participants: Array<{
    _id: string;
    username: string;
    fullName: string;
    profileImageUrl?: string;
  }>;
  chatType: 'direct' | 'group';
  groupName?: string;
  groupDescription?: string;
  groupImage?: string;
  admins?: string[];
  createdBy: {
    _id: string;
    username: string;
    fullName: string;
    profileImageUrl?: string;
  };
  lastMessage?: {
    sender: string;
    message: string;
    timestamp: string;
  };
  lastMessageAt: string;
  unreadCount?: number;
  mutedBy?: string[];
  pinnedMessages?: string[];
  blockedUsers?: string[];
}

export interface ChatResponse {
  chats: Chat[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalChats: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface MessagesResponse {
  messages: Message[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalMessages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// API functions
export const messageAPI = {
  // Get all chats for the current user (legacy method - now gets active chats)
  getUserChats: async (page = 1, limit = 20): Promise<ChatResponse> => {
    try {
      const response = await axiosInstance.get(`/chats?page=${page}&limit=${limit}&chatStatus=active`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching chats:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get active chats for the current user
  getActiveChats: async (page = 1, limit = 20): Promise<ChatResponse> => {
    try {
      const response = await axiosInstance.get(`/chats?page=${page}&limit=${limit}&chatStatus=active`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching active chats:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create a new chat
  createChat: async (participants: string[], chatType = 'direct', groupName?: string, groupDescription?: string): Promise<Chat> => {
    try {
      const response = await axiosInstance.post('/chats', {
        participants,
        chatType,
        groupName,
        groupDescription
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating chat:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get messages for a specific chat
  getChatMessages: async (chatId: string, page = 1, limit = 50): Promise<MessagesResponse> => {
    const response = await axiosInstance.get(`/chats/${chatId}/messages?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  // Send a message
  sendMessage: async (chatId: string, message: string, messageType = 'text', replyTo?: string): Promise<Message> => {
    const response = await axiosInstance.post(`/chats/${chatId}/messages`, {
      message,
      messageType,
      replyTo
    });
    return response.data.data;
  },

  // Mark messages as read
  markMessagesRead: async (chatId: string, messageIds?: string[]): Promise<void> => {
    await axiosInstance.patch(`/chats/${chatId}/read`, {
      messageIds
    });
  },

  // Delete a message
  deleteMessage: async (chatId: string, messageId: string): Promise<void> => {
    await axiosInstance.delete(`/chats/${chatId}/messages/${messageId}`);
  },

  // Restore a deleted message
  restoreMessage: async (chatId: string, messageId: string): Promise<Message> => {
    const response = await axiosInstance.patch(`/chats/${chatId}/messages/${messageId}/restore`);
    return response.data.data;
  },

  // Start typing indicator
  startTyping: async (chatId: string): Promise<void> => {
    await axiosInstance.post(`/chats/${chatId}/typing/start`);
  },

  // Stop typing indicator
  stopTyping: async (chatId: string): Promise<void> => {
    await axiosInstance.post(`/chats/${chatId}/typing/stop`);
  },

  // Get online status of users
  getOnlineStatus: async (userIds: string[]): Promise<{ [userId: string]: boolean }> => {
    const response = await axiosInstance.get('/chats/users/online-status', {
      params: { userIds }
    });
    return response.data.data.onlineStatus;
  },

  // Search messages in a chat
  searchMessages: async (chatId: string, query: string, page = 1, limit = 20): Promise<{
    messages: Message[];
    query: string;
    totalResults: number;
    pagination: {
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> => {
    const response = await axiosInstance.get(`/chats/${chatId}/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data.data;
  },

  // Get user's following list
  getUserFollowing: async (userId: string): Promise<Array<{
    _id: string;
    username: string;
    fullName: string;
    profileImageUrl?: string;
  }>> => {
    try {
      const response = await axiosInstance.get(`/users/following/${userId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching user following:', error.response?.data || error.message);
      throw error;
    }
  },

  // Follow a user
  followUser: async (userId: string): Promise<void> => {
    try {
      await axiosInstance.post('/users/follow', { userId });
    } catch (error: any) {
      console.error('Error following user:', error.response?.data || error.message);
      throw error;
    }
  },

  // Accept message request
  acceptMessageRequest: async (chatId: string): Promise<void> => {
    try {
      await axiosInstance.patch(`/chats/${chatId}/accept`);
    } catch (error: any) {
      console.error('Error accepting message request:', error.response?.data || error.message);
      throw error;
    }
  },

  // Decline message request
  declineMessageRequest: async (chatId: string): Promise<void> => {
    try {
      await axiosInstance.patch(`/chats/${chatId}/decline`);
    } catch (error: any) {
      console.error('Error declining message request:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get message requests
  getMessageRequests: async (page = 1, limit = 20): Promise<ChatResponse> => {
    try {
      const response = await axiosInstance.get(`/chats?page=${page}&limit=${limit}&chatStatus=requested`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching message requests:', error.response?.data || error.message);
      throw error;
    }
  }
};