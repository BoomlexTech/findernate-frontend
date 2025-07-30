"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MessageSquare, Bell, Phone, Video, MoreHorizontal, Search, Send, Paperclip, Smile, Trash2, MoreVertical, Check, CheckCheck, Users, MessageCircle } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { messageAPI, Chat, Message } from "@/api/message";
import socketManager from "@/utils/socket";
import { useSearchParams } from "next/navigation";
import { getFollowing } from "@/api/user";
import { AxiosError } from "axios";

export default function MessagePanel() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const selectedChatRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState<{messageId: string, x: number, y: number} | null>(null);
  const [activeTab, setActiveTab] = useState<'direct' | 'group'>('direct');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const user = useUserStore((state) => state.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  const selected = chats.find((chat) => chat._id === selectedChat);

  // Update ref when selectedChat changes
  useEffect(() => {
    console.log('selectedChat changed to:', selectedChat);
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketManager.connect(token);
    }

    return () => {
      // Clean up typing indicators on unmount
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTypingIndicator();
      socketManager.disconnect();
    };
  }, []);

  // Load chats on mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        
        // Test if the endpoint exists
        console.log('Attempting to load chats from:', process.env.NEXT_PUBLIC_API_BASE_URL);
        
        const response = await messageAPI.getUserChats();
        // Sort chats by most recent message
        const sortedChats = response.chats.sort((a, b) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
        setChats(sortedChats);
      } catch (error) {
        console.error('Failed to load chats:', error);
        const axiosError = error as AxiosError;
        console.log(axiosError.response?.status);
        // If it's a 404, the route might not exist on the server
        if (axiosError.response?.status === 404) {
          console.error('Chat routes not found on the server. This might be a deployment issue.');
          // For now, initialize with empty chats to prevent crashes
          setChats([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadChats();
    }
  }, [user]);

  // Handle chatId from URL parameters
  useEffect(() => {
    const chatId = searchParams.get('chatId');
    if (chatId && chats.length > 0 && !selectedChat) {
      // Only set from URL if no chat is currently selected
      const chatExists = chats.find(chat => chat._id === chatId);
      if (chatExists) {
        console.log('Setting selectedChat from URL params:', chatId);
        setSelectedChat(chatId);
      }
    }
  }, [searchParams, chats, selectedChat]);

  // Disabled this effect as it might be causing chat selection issues
  // useEffect(() => {
  //   if (selectedChat && chats.length > 0) {
  //     // Ensure the selected chat still exists in the list
  //     const stillExists = chats.find(chat => chat._id === selectedChat);
  //     if (!stillExists) {
  //       setSelectedChat(null);
  //     }
  //   }
  // }, [chats, selectedChat]);

  // Load messages when chat is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat) return;

      try {
        const response = await messageAPI.getChatMessages(selectedChat);
        setMessages(response.messages);
        socketManager.joinChat(selectedChat);
        
        // Mark messages as read
        await messageAPI.markMessagesRead(selectedChat);
        
        // Reset unread count for selected chat
        setChats(prev => prev.map(chat => 
          chat._id === selectedChat 
            ? { ...chat, unreadCount: 0 }
            : chat
        ));
        
        // Mark unread messages as seen
        markUnreadMessagesAsSeen(response.messages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();

    return () => {
      if (selectedChat) {
        // Stop typing indicator when leaving chat
        stopTypingIndicator();
        socketManager.leaveChat(selectedChat);
      }
    };
  }, [selectedChat]);

  // Socket event listeners
  useEffect(() => {
    const handleNewMessage = (data: { chatId: string; message: Message }) => {
      if (data.chatId === selectedChatRef.current) {
        console.log('Socket: Received new message', data.message._id);
        // Check if message already exists to prevent duplicates
        setMessages(prev => {
          const messageExists = prev.some(msg => msg._id === data.message._id);
          console.log('Socket: Message exists?', messageExists, 'Message ID:', data.message._id);
          if (messageExists) {
            console.log('Socket: Skipping duplicate message');
            return prev; // Don't add duplicate
          }
          console.log('Socket: Adding new message to state');
          return [...prev, data.message];
        });
        scrollToBottom();
      }
      
      // Update chat list with new message and reorder by most recent
      setChats(prev => {
        console.log('Socket: Updating chat list for chatId:', data.chatId);
        const updatedChats = prev.map(chat => {
          if (chat._id === data.chatId) {
            console.log('Socket: Moving chat to top:', data.chatId);
            return {
              ...chat, 
              lastMessage: { 
                sender: data.message.sender._id, 
                message: data.message.message, 
                timestamp: data.message.timestamp 
              }, 
              lastMessageAt: data.message.timestamp,
              // Increment unread count if not the selected chat
              unreadCount: data.chatId !== selectedChatRef.current ? (chat.unreadCount || 0) + 1 : 0
            };
          }
          return chat;
        });
        
        // Sort chats by lastMessageAt to bring the most recent to top
        const sortedChats = updatedChats.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        console.log('Socket: Chats reordered, top chat:', sortedChats[0]?.lastMessage?.message);
        return sortedChats;
      });
    };


    const handleUserTyping = (data: { userId: string; chatId: string; username: string; fullName?: string }) => {
      if (data.chatId === selectedChatRef.current && data.userId !== user?._id) {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(data.userId, data.fullName || data.username);
          return newMap;
        });
      }
    };

    const handleUserStoppedTyping = (data: { userId: string; chatId: string }) => {
      if (data.chatId === selectedChatRef.current) {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
      }
    };

    const handleMessageDeleted = (data: { chatId: string; messageId: string }) => {
      if (data.chatId === selectedChatRef.current) {
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      }
    };

    const handleMessagesRead = (data: { chatId: string; readBy: {_id: string}; messageIds?: string[] }) => {
      if (data.chatId === selectedChatRef.current) {
        setMessages(prev => prev.map(msg => {
          if (data.messageIds) {
            // Specific messages were marked as read
            if (data.messageIds.includes(msg._id)) {
              return { ...msg, readBy: [...msg.readBy.filter(id => id !== data.readBy._id), data.readBy._id] };
            }
          } else {
            // All messages were marked as read
            if (!msg.readBy.includes(data.readBy._id)) {
              return { ...msg, readBy: [...msg.readBy, data.readBy._id] };
            }
          }
          return msg;
        }));
      }
    };

    socketManager.on('new_message', handleNewMessage);
    socketManager.on('user_typing', handleUserTyping);
    socketManager.on('user_stopped_typing', handleUserStoppedTyping);
    socketManager.on('message_deleted', handleMessageDeleted);
    socketManager.on('messages_read', handleMessagesRead);

    return () => {
      socketManager.off('new_message', handleNewMessage);
      socketManager.off('user_typing', handleUserTyping);
      socketManager.off('user_stopped_typing', handleUserStoppedTyping);
      socketManager.off('message_deleted', handleMessageDeleted);
      socketManager.off('messages_read', handleMessagesRead);
    };
  }, [selectedChat, user]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    
    // Mark new messages as seen when they arrive
    if (messages.length > 0) {
      const latestMessages = messages.slice(-5); // Check last 5 messages
      markUnreadMessagesAsSeen(latestMessages);
    }
  }, [messages]);

  // Intersection Observer to mark messages as seen when they come into view
  useEffect(() => {
    if (!messagesContainerRef.current || !user) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            if (messageId) {
              markMessageAsSeen(messageId);
            }
          }
        });
      },
      {
        root: messagesContainerRef.current,
        threshold: 0.8, // Mark as seen when 80% of message is visible
      }
    );

    // Observe all message elements
    const messageElements = messagesContainerRef.current.querySelectorAll('[data-message-id]');
    messageElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [messages, user]);

  // Send message function
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || sendingMessage) return;

    const messageText = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX
    
    // Stop typing indicator when sending message
    await stopTypingIndicator();
    
    try {
      setSendingMessage(true);
      const message = await messageAPI.sendMessage(selectedChat, messageText);
      
      // Add message immediately from API response
      console.log('API: Adding message from API response', message._id);
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some(msg => msg._id === message._id);
        console.log('API: Message exists?', messageExists, 'Message ID:', message._id);
        if (messageExists) {
          console.log('API: Skipping duplicate message');
          return prev;
        }
        console.log('API: Adding new message to state');
        return [...prev, message];
      });
      
      // Update chat list when sending a message to move current chat to top
      setChats(prev => {
        const updatedChats = prev.map(chat => 
          chat._id === selectedChat 
            ? { ...chat, lastMessage: { sender: message.sender._id, message: message.message, timestamp: message.timestamp }, lastMessageAt: message.timestamp }
            : chat
        );
        
        // Sort chats by lastMessageAt to bring the current chat to top
        return updatedChats.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      });
      
      scrollToBottom();
      
      // Keep input focused after sending message
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      // If sending fails, restore the message text
      setNewMessage(messageText);
    } finally {
      setSendingMessage(false);
    }
  };

  // Mark unread messages as seen
  const markUnreadMessagesAsSeen = async (messagesToCheck: Message[]) => {
    if (!user || !selectedChat) return;
    
    const unreadMessages = messagesToCheck.filter(msg => 
      msg.sender._id !== user._id && !msg.readBy.includes(user._id)
    );
    
    if (unreadMessages.length > 0) {
      const unreadMessageIds = unreadMessages.map(msg => msg._id);
      try {
        await messageAPI.markMessagesRead(selectedChat, unreadMessageIds);
        // Update local state to mark messages as read
        setMessages(prev => prev.map(msg => 
          unreadMessageIds.includes(msg._id) 
            ? { ...msg, readBy: [...msg.readBy, user._id] }
            : msg
        ));
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }
    }
  };

  // Mark messages as seen when they come into view
  const markMessageAsSeen = async (messageId: string) => {
    if (!user || !selectedChat) return;
    
    const message = messages.find(msg => msg._id === messageId);
    if (!message || message.sender._id === user._id || message.readBy.includes(user._id)) {
      return; // Don't mark own messages or already read messages
    }
    
    try {
      await messageAPI.markMessagesRead(selectedChat, [messageId]);
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, readBy: [...msg.readBy, user._id] }
          : msg
      ));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  // Handle message deletion
  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedChat || !window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await messageAPI.deleteMessage(selectedChat, messageId);
      // Remove message from local state
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      // Also emit socket event for real-time update
      socketManager.deleteMessage(selectedChat, messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message');
    }
    setShowContextMenu(null);
  };

  // Handle typing indicators with API calls
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (selectedChat) {
      // Start typing if not already typing
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        // Call API to start typing
        messageAPI.startTyping(selectedChat).catch(console.error);
        // Also emit socket event for immediate feedback
        socketManager.startTyping(selectedChat);
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(async () => {
        if (isTypingRef.current) {
          isTypingRef.current = false;
          try {
            // Call API to stop typing
            await messageAPI.stopTyping(selectedChat);
            // Also emit socket event
            socketManager.stopTyping(selectedChat);
          } catch (error) {
            console.error('Error stopping typing:', error);
          }
        }
      }, 3000);
    }
  };

  // Stop typing when user sends message or leaves chat
  const stopTypingIndicator = async () => {
    if (selectedChat && isTypingRef.current) {
      isTypingRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      try {
        await messageAPI.stopTyping(selectedChat);
        socketManager.stopTyping(selectedChat);
      } catch (error) {
        console.error('Error stopping typing:', error);
      }
    }
  };

  // Format time helper
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Get chat display name
  const getChatDisplayName = (chat: Chat) => {
    if (chat.chatType === 'group') {
      return chat.groupName || 'Group Chat';
    }
    const otherParticipant = chat.participants.find(p => p._id !== user?._id);
    return otherParticipant?.fullName || otherParticipant?.username || 'Unknown User';
  };

  // Get chat avatar
  const getChatAvatar = (chat: Chat) => {
    if (chat.chatType === 'group') {
      return chat.groupImage || '/placeholderimg.png';
    }
    const otherParticipant = chat.participants.find(p => p._id !== user?._id);
    return otherParticipant?.profileImageUrl || '/placeholderimg.png';
  };

  // Filter chats based on search query and tab
  const filteredChats = chats.filter(chat => {
    // Filter by tab
    if (activeTab === 'direct' && chat.chatType !== 'direct') return false;
    if (activeTab === 'group' && chat.chatType !== 'group') return false;
    
    // Filter by search query
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const chatName = getChatDisplayName(chat).toLowerCase();
    const lastMessage = chat.lastMessage?.message?.toLowerCase() || '';
    
    return chatName.includes(searchLower) || lastMessage.includes(searchLower);
  });

  // Calculate unread counts for each tab
  const directUnreadCount = chats
    .filter(chat => chat.chatType === 'direct')
    .reduce((total, chat) => total + (chat.unreadCount || 0), 0);
  
  const groupUnreadCount = chats
    .filter(chat => chat.chatType === 'group')
    .reduce((total, chat) => total + (chat.unreadCount || 0), 0);

  // Load following users for new chat
  const loadFollowingUsers = async () => {
    if (!user) return;
    
    setLoadingFollowing(true);
    try {
      const following = await getFollowing(user._id);
      setFollowingUsers(following || []);
    } catch (error) {
      console.error('Failed to load following users:', error);
      setFollowingUsers([]);
    } finally {
      setLoadingFollowing(false);
    }
  };

  // Handle new chat creation
  const handleNewChat = () => {
    setShowNewChatModal(true);
    loadFollowingUsers();
  };

  // Create chat with selected user
  const createChatWithUser = async (selectedUser: any) => {
    try {
      if (!user) return;
      
      const participants = [user._id, selectedUser._id];
      const chat = await messageAPI.createChat(participants, 'direct');
      
      // Add new chat to the list if it doesn't exist, or move existing to top
      setChats(prev => {
        const chatExists = prev.some(c => c._id === chat._id);
        if (chatExists) {
          // Move existing chat to top
          const updatedChats = prev.filter(c => c._id !== chat._id);
          return [chat, ...updatedChats];
        }
        // Add new chat to top
        return [chat, ...prev];
      });
      
      // Select the new chat
      setSelectedChat(chat._id);
      setShowNewChatModal(false);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  // Create group chat
  const createGroupChat = async () => {
    try {
      if (!user || !groupName.trim() || selectedGroupMembers.length === 0) return;
      
      const participants = [user._id, ...selectedGroupMembers];
      const chat = await messageAPI.createChat(participants, 'group', groupName.trim(), groupDescription.trim() || undefined);
      
      // Add new group chat to the list
      setChats(prev => [chat, ...prev]);
      
      // Select the new group chat
      setSelectedChat(chat._id);
      
      // Reset group creation form
      setGroupName("");
      setGroupDescription("");
      setSelectedGroupMembers([]);
      setShowGroupModal(false);
      
      // Switch to group tab
      setActiveTab('group');
    } catch (error) {
      console.error('Failed to create group chat:', error);
    }
  };

  // Toggle group member selection
  const toggleGroupMember = (userId: string) => {
    setSelectedGroupMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="flex w-full h-screen">
      {/* Left Panel */}
      <div className="w-1/3 border-r bg-white flex flex-col">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-600 mt-1">Connect with businesses and users</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">Personal Account</p>
              </div>
              {user?.profileImageUrl &&
                <Image width={10} height={10} src={user?.profileImageUrl} alt="Avantika" className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400" />
              }
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setActiveTab('direct')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'direct'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Direct
              {directUnreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs min-w-[18px] h-4 flex items-center justify-center rounded-full px-1">
                  {directUnreadCount > 99 ? '99+' : directUnreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'group'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4" />
              Groups
              {groupUnreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs min-w-[18px] h-4 flex items-center justify-center rounded-full px-1">
                  {groupUnreadCount > 99 ? '99+' : groupUnreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleNewChat}
              className="flex-1 bg-button-gradient text-white py-2.5 rounded-lg font-medium shadow hover:bg-yellow-500 transition cursor-pointer"
            >
              + New Chat
            </button>
            <button 
              onClick={() => {
                setShowGroupModal(true);
                loadFollowingUsers();
              }}
              className="flex-1 bg-green-500 text-white py-2.5 rounded-lg font-medium shadow hover:bg-green-600 transition cursor-pointer"
            >
              + New Group
            </button>
          </div>
        </div>

        <div className="px-6 py-4 relative">
          <Search className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black placeholder-gray-400" 
          />
        </div>

        <div className="overflow-y-auto px-4 flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Loading chats...</div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">
                {searchQuery.trim() ? 'No chats found matching your search' : 'No chats available'}
              </div>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div 
                key={chat._id} 
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-yellow-50 transition ${selectedChat === chat._id ? "bg-yellow-50 border border-yellow-300" : ""}`} 
                onClick={() => {
                  console.log('Selecting chat:', chat._id);
                  setSelectedChat(chat._id);
                }}
              >
                <Image src={getChatAvatar(chat)} alt={getChatDisplayName(chat)} width={48} height={48} className="rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-black">{getChatDisplayName(chat)}</span>
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">{chat.chatType === 'group' ? 'Group' : 'Direct'}</span>
                    <span className="ml-auto text-xs text-gray-400">{formatTime(chat.lastMessageAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage?.message || 'No messages yet'}</p>
                </div>
                {(chat.unreadCount ?? 0) > 0 && (
                  <div className="ml-2 bg-yellow-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full px-1 animate-pulse">
                    {chat?.unreadCount && chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        {selected ? (
          <div className="flex flex-col w-full h-full">
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div 
                  className={`flex items-center space-x-4 ${selected.chatType === 'group' ? 'cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors' : ''}`}
                  onClick={() => selected.chatType === 'group' && setShowGroupDetails(true)}
                >
                  <Image width={12} height={12} src={getChatAvatar(selected)} alt={getChatDisplayName(selected)} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-semibold text-gray-900">{getChatDisplayName(selected)}</h2>
                      <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">{selected.chatType === 'group' ? 'Group' : 'Direct'}</div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {typingUsers.size > 0 ? (
                        typingUsers.size === 1 
                          ? `${Array.from(typingUsers.values())[0]} is typing...`
                          : `${typingUsers.size} users are typing...`
                      ) : (
                        selected.chatType === 'group' 
                          ? `${selected.participants.length} members • Click to view`
                          : 'Online'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-gray-500">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-gray-500">No messages yet. Start a conversation!</div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg._id} 
                    data-message-id={msg._id}
                    className={`flex ${msg.sender._id === user?._id ? "justify-end" : "justify-start"} mb-4 group relative`}
                  >
                    <div className={`max-w-md px-4 py-3 rounded-2xl relative ${
                      msg.sender._id === user?._id 
                        ? "bg-[#DBB42C] text-white" 
                        : "bg-gray-100 text-gray-900"
                    }`}>
                      {(msg.sender._id !== user?._id || selected?.chatType === 'group') && (
                        <p className="text-xs font-medium mb-1 opacity-80">
                          {msg.sender._id === user?._id ? 'You' : (msg.sender.fullName || msg.sender.username)}
                        </p>
                      )}
                      <p>{msg.message}</p>
                      <div className={`flex items-center justify-between mt-1 text-xs ${
                        msg.sender._id === user?._id ? "text-yellow-100" : "text-gray-500"
                      }`}>
                        <span className="flex-1 text-right">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.sender._id === user?._id && (
                          <span className="ml-2 flex items-center">
                            {msg.readBy.length > 1 ? ( // More than just sender (means someone else read it)
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3"  />
                            )}
                          </span>
                        )}
                      </div>
                      
                      {/* Context menu button - only show for current user's messages */}
                      {msg.sender._id === user?._id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowContextMenu({
                              messageId: msg._id,
                              x: e.clientX,
                              y: e.clientY
                            });
                          }}
                          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-gray-600 text-white p-1 rounded-full hover:bg-gray-700 transition-all"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    
                    {/* Unread indicator for received messages */}
                    {msg.sender._id !== user?._id && !msg.readBy.includes(user?._id || '') && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2" title="Unread message" />
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <button type="button" className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>

                <div className="relative flex-1">
                  <input 
                    ref={messageInputRef}
                    type="text" 
                    placeholder="Type a message..." 
                    value={newMessage}
                    onChange={handleInputChange}
                    disabled={sendingMessage}
                    className="w-full py-3 px-4 pr-10 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 text-black placeholder-gray-400" 
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || sendingMessage}
                  className="p-3 bg-[#DBB42C] hover:bg-yellow-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <MessageSquare className="mx-auto mb-4 w-10 h-10 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-800">Select a conversation</h3>
            <p className="text-gray-500 mt-1">Choose a conversation to start messaging</p>
            <button className="mt-4 bg-button-gradient text-white px-4 py-2 rounded-lg hover:bg-yellow-500">
              Start New Chat
            </button>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowContextMenu(null)}
          />
          <div 
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]"
            style={{
              left: showContextMenu.x,
              top: showContextMenu.y,
              transform: 'translate(-50%, -10px)'
            }}
          >
            <button
              onClick={() => handleDeleteMessage(showContextMenu.messageId)}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Start New Chat</h2>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingFollowing ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-500">Loading your following...</div>
                </div>
              ) : followingUsers.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-500">You&apos;re not following anyone yet</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {followingUsers.map((followingUser) => (
                    <div
                      key={followingUser._id}
                      onClick={() => createChatWithUser(followingUser)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <Image
                        src={followingUser.profileImageUrl || '/placeholderimg.png'}
                        alt={followingUser.fullName || followingUser.username}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {followingUser.fullName || followingUser.username}
                        </p>
                        {followingUser.username && followingUser.fullName && (
                          <p className="text-sm text-gray-500">@{followingUser.username}</p>
                        )}
                      </div>
                      <MessageSquare className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Group Chat Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Create Group Chat</h2>
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setGroupName("");
                  setGroupDescription("");
                  setSelectedGroupMembers([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Group Details Form */}
              <div className="p-6 border-b">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter group name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-gray-400"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="Enter group description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-gray-400"
                      maxLength={200}
                    />
                  </div>
                </div>
              </div>

              {/* Member Selection */}
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Select Members ({selectedGroupMembers.length} selected)
                </h3>
                {loadingFollowing ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-gray-500">Loading your following...</div>
                  </div>
                ) : followingUsers.length === 0 ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-gray-500">You're not following anyone yet</div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {followingUsers.map((followingUser) => (
                      <label
                        key={followingUser._id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedGroupMembers.includes(followingUser._id)}
                          onChange={() => toggleGroupMember(followingUser._id)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                        />
                        <Image
                          src={followingUser.profileImageUrl || '/placeholderimg.png'}
                          alt={followingUser.fullName || followingUser.username}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {followingUser.fullName || followingUser.username}
                          </p>
                          {followingUser.username && followingUser.fullName && (
                            <p className="text-xs text-gray-500">@{followingUser.username}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setGroupName("");
                  setGroupDescription("");
                  setSelectedGroupMembers([]);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createGroupChat}
                disabled={!groupName.trim() || selectedGroupMembers.length === 0}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Details Modal */}
      {showGroupDetails && selected && selected.chatType === 'group' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Group Details</h2>
              <button
                onClick={() => setShowGroupDetails(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Group Info */}
              <div className="p-6 border-b">
                <div className="flex items-center space-x-4 mb-4">
                  <Image
                    src={getChatAvatar(selected)}
                    alt={getChatDisplayName(selected)}
                    width={60}
                    height={60}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{getChatDisplayName(selected)}</h3>
                    <p className="text-sm text-gray-500">{selected.participants.length} members</p>
                  </div>
                </div>
                {selected.groupDescription && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{selected.groupDescription}</p>
                  </div>
                )}
              </div>

              {/* Group Members */}
              <div className="p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Members ({selected.participants.length})</h4>
                <div className="space-y-3">
                  {selected.participants.map((participant) => (
                    <div key={participant._id} className="flex items-center gap-3">
                      <Image
                        src={participant.profileImageUrl || '/placeholderimg.png'}
                        alt={participant.fullName || participant.username}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {participant.fullName || participant.username}
                          {participant._id === user?._id && (
                            <span className="text-xs text-gray-500 ml-2">(You)</span>
                          )}
                          {selected.admins?.includes(participant._id) && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full ml-2">Admin</span>
                          )}
                          {participant._id === selected.createdBy._id && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-2">Creator</span>
                          )}
                        </p>
                        {participant.username && participant.fullName && (
                          <p className="text-sm text-gray-500">@{participant.username}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowGroupDetails(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}