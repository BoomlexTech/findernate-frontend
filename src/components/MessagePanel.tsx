"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MessageSquare, Bell, Phone, Video, MoreHorizontal, Search, Send, Paperclip, Smile, Trash2, MoreVertical, Check, CheckCheck, Users, MessageCircle, Mail } from "lucide-react";
import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { useUserStore } from "@/store/useUserStore";
import { messageAPI, Chat, Message } from "@/api/message";
import socketManager from "@/utils/socket";
import { useSearchParams, useRouter } from "next/navigation";
import { getFollowing } from "@/api/user";
import { AxiosError } from "axios";
import { followEvents } from "@/utils/followEvents";

// Constants
const REQUEST_DECISIONS_KEY = 'message_request_decisions';

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
  const [activeTab, setActiveTab] = useState<'direct' | 'group' | 'requests'>('direct');
  const [messageRequests, setMessageRequests] = useState<Chat[]>([]);
  const [userFollowingList, setUserFollowingList] = useState<string[]>([]);
  const [requestDecisionCache, setRequestDecisionCache] = useState<Map<string, 'accepted' | 'declined'>>(new Map());
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [allChatsCache, setAllChatsCache] = useState<Chat[]>([]); // Keep track of all chats
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  const selected = chats.find((chat) => chat._id === selectedChat);

  // Handle profile navigation for direct chats
  const handleProfileClick = (chat: Chat) => {
    if (chat.chatType === 'direct') {
      // Find the other participant (not the current user)
      const otherParticipant = chat.participants.find(p => p && p._id && p._id !== user?._id);
      if (otherParticipant && otherParticipant.username) {
        router.push(`/userprofile/${otherParticipant.username}`);
      }
    } else if (chat.chatType === 'group') {
      setShowGroupDetails(true);
    }
  };

  // Helper function to determine if a message request is incoming (should be shown) or outgoing (should be hidden)
  const isIncomingRequest = (chat: Chat, currentUserId: string): boolean => {
    // Check if this is a legitimate incoming request
    
    // 1. Must be a direct chat
    if (chat.chatType !== 'direct') {
      return false;
    }
    
    // 2. Check participants - should have exactly 2 participants
    const validParticipants = chat.participants.filter(p => p && p._id);
    if (validParticipants.length !== 2) {
      return false;
    }
    
    // 3. Current user must be one of the participants
    const isParticipant = validParticipants.some(p => p._id === currentUserId);
    if (!isParticipant) {
      return false;
    }
    
    // 4. Key fix: Check who created the chat, not who sent the last message
    // If current user created the chat, it's an outgoing request (should be hidden)
    if (chat.createdBy && chat.createdBy._id === currentUserId) {
      console.log('Filtering out outgoing request (created by current user):', chat._id);
      return false;
    }
    
    // 5. Ensure there's another participant who is not the current user
    const otherParticipant = validParticipants.find(p => p._id !== currentUserId);
    if (!otherParticipant) {
      console.log('Filtering out request with no other participant:', chat._id);
      return false;
    }
    
    console.log('Allowing incoming request:', {
      chatId: chat._id,
      otherParticipant: otherParticipant.username || otherParticipant.fullName,
      createdBy: chat.createdBy?._id || 'unknown'
    });
    
    return true;
  };

  // Update ref when selectedChat changes
  useEffect(() => {
    console.log('selectedChat changed to:', selectedChat);
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Initialize socket connection
  useEffect(() => {
    // Validate and get token using UserStore
    const { validateAndGetToken, logout } = useUserStore.getState();
    const validToken = validateAndGetToken();
    
    if (validToken) {
      socketManager.connect(validToken);
    } else {
      console.warn('No valid token for socket connection');
    }

    // Handle permanent authentication failures
    const handleAuthFailure = (data: any) => {
      console.error('Permanent authentication failure:', data.message);
      alert('Your session has expired. Please log in again.');
      logout();
      router.push('/signin');
    };

    const handleConnectionFailure = (data: any) => {
      console.error('Permanent connection failure:', data.message);
      // Could show a user-friendly message here
    };

    // Listen for permanent failures
    socketManager.on('auth_failure_permanent', handleAuthFailure);
    socketManager.on('connection_failed_permanent', handleConnectionFailure);

    return () => {
      // Clean up typing indicators on unmount
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTypingIndicator();
      
      // Remove event listeners
      socketManager.off('auth_failure_permanent', handleAuthFailure);
      socketManager.off('connection_failed_permanent', handleConnectionFailure);
      
      socketManager.disconnect();
    };
  }, [router]);

  // Load cached decisions and user following list on mount
  useEffect(() => {
    // Load cached decisions from localStorage
    const savedDecisions = localStorage.getItem(REQUEST_DECISIONS_KEY);
    if (savedDecisions) {
      try {
        const decisionsArray = JSON.parse(savedDecisions);
        setRequestDecisionCache(new Map(decisionsArray));
      } catch (error) {
        console.error('Error loading cached decisions:', error);
      }
    }

    // Load user's following list
    const loadUserFollowing = async () => {
      if (user) {
        try {
          console.log('Loading following list for user:', user.username);
          const following = await messageAPI.getUserFollowing(user._id);
          const followingIds = following.filter(u => u && u._id).map(u => u._id);
          console.log('Following list loaded:', {
            count: followingIds.length,
            users: following.filter(u => u && u._id).map(u => ({ id: u._id, username: u.username }))
          });
          console.log('Following IDs array:', followingIds);
          setUserFollowingList(followingIds);
        } catch (error) {
          console.error('Failed to load user following:', error);
          setUserFollowingList([]);
        }
      }
    };

    loadUserFollowing();
  }, [user]);

  // Load chats on mount
  useEffect(() => {
    const loadChatsAndRequests = async () => {
      try {
        setLoading(true);
        
        console.log('Loading active chats and requests from:', process.env.NEXT_PUBLIC_API_BASE_URL);
        
        // Load both active chats and message requests in parallel
        const [activeChatsResponse, requestsResponse] = await Promise.all([
          messageAPI.getActiveChats(),
          messageAPI.getMessageRequests()
        ]);
        
        console.log('Active chats from server:', activeChatsResponse.chats.length);
        activeChatsResponse.chats.forEach((chat, index) => {
          console.log(`Active chat ${index + 1}:`, {
            id: chat._id,
            type: chat.chatType,
            participants: chat.participants.map(p => ({ id: p._id, username: p.username })),
            lastMessage: chat.lastMessage?.message || 'No message',
            lastMessageAt: chat.lastMessageAt
          });
        });
        
        console.log('Message requests from server:', requestsResponse.chats.length);
        requestsResponse.chats.forEach((chat, index) => {
          console.log(`Request ${index + 1}:`, {
            id: chat._id,
            type: chat.chatType,
            participants: chat.participants,
            participantsProcessed: chat.participants.map(p => ({ 
              id: p?._id, 
              username: p?.username, 
              fullName: p?.fullName,
              isNull: p === null,
              isUndefined: p === undefined
            })),
            lastMessage: chat.lastMessage?.message || 'No message',
            lastMessageSender: chat.lastMessage?.sender,
            lastMessageAt: chat.lastMessageAt
          });
        });
        
        // Sort chats by most recent message
        const sortedActiveChats = activeChatsResponse.chats.sort((a, b) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
        
        // Filter message requests to only show incoming requests (not outgoing ones)
        const filteredRequests = requestsResponse.chats.filter(chat => {
          if (!user?._id) return false;
          return isIncomingRequest(chat, user._id);
        });
        
        console.log('Original requests:', requestsResponse.chats.length);
        console.log('Filtered requests (incoming only):', filteredRequests.length);
        
        const sortedRequests = filteredRequests.sort((a, b) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
        
        // Set the chats directly from server response
        setChats(sortedActiveChats);
        setMessageRequests(sortedRequests);
        setAllChatsCache([...sortedActiveChats, ...sortedRequests]);
        
      } catch (error) {
        console.error('Failed to load chats:', error);
        const axiosError = error as AxiosError;
        console.log(axiosError.response?.status);
        // Initialize with empty chats to prevent crashes
        setChats([]);
        setMessageRequests([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadChatsAndRequests();
    }
  }, [user]);

  // Simple categorization for when we need to update chats locally
  const categorizeChats = (allChats: Chat[]) => {
    // This is now mainly used for updating chats after socket events
    // The server handles the main categorization
    console.log('Local categorization called with:', allChats.length, 'chats');
    
    const regularChats: Chat[] = [];
    const requestChats: Chat[] = [];

    allChats.forEach((chat) => {
      // Check if this chat is already in requests or decisions cache
      const decision = requestDecisionCache.get(chat._id);
      
      if (decision === 'declined') {
        // Hide declined requests
        return;
      } else if (decision === 'accepted') {
        // Accepted requests go to regular chats
        regularChats.push(chat);
      } else {
        // Let server categorization be the primary source
        // This is mainly for local updates after socket events
        const existsInRequests = messageRequests.some(r => r._id === chat._id);
        const existsInRegular = chats.some(c => c._id === chat._id);
        
        if (existsInRequests) {
          requestChats.push(chat);
        } else {
          regularChats.push(chat);
        }
      }
    });

    console.log('Local categorization result:', {
      regularChats: regularChats.length,
      requestChats: requestChats.length
    });

    setChats(regularChats);
    setMessageRequests(requestChats);
  };

  // Recategorize chats when following list or decisions change
  useEffect(() => {
    if (allChatsCache.length > 0 && userFollowingList.length >= 0) {
      console.log('Recategorizing due to following list change');
      categorizeChats(allChatsCache);
    }
  }, [userFollowingList, requestDecisionCache, allChatsCache, user]);

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
      // Find the chat in both regular chats and requests
      const chatInRegular = chats.find(c => c._id === data.chatId);
      const chatInRequests = messageRequests.find(r => r._id === data.chatId);
      const chat = chatInRegular || chatInRequests;
      
      if (!chat) {
        // If chat doesn't exist, it might be a new chat - reload both lists
        console.log('New message from unknown chat, reloading chats...');
        if (user) {
          Promise.all([
            messageAPI.getActiveChats(),
            messageAPI.getMessageRequests()
          ]).then(([activeChatsResponse, requestsResponse]) => {
            const sortedActiveChats = activeChatsResponse.chats.sort((a, b) => 
              new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
            );
            
            // Filter message requests to only show incoming requests
            const filteredRequests = requestsResponse.chats.filter(chat => {
              if (!user?._id) return false;
              return isIncomingRequest(chat, user._id);
            });
            
            const sortedRequests = filteredRequests.sort((a, b) => 
              new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
            );
            setChats(sortedActiveChats);
            setMessageRequests(sortedRequests);
            setAllChatsCache([...sortedActiveChats, ...sortedRequests]);
          }).catch(error => console.error('Failed to reload chats:', error));
        }
        return;
      }

      // Update messages if this is the selected chat
      if (data.chatId === selectedChatRef.current) {
        console.log('Socket: Received new message', data.message._id);
        setMessages(prev => {
          const messageExists = prev.some(msg => msg._id === data.message._id);
          if (messageExists) {
            console.log('Socket: Skipping duplicate message');
            return prev;
          }
          console.log('Socket: Adding new message to state');
          return [...prev, data.message];
        });
        scrollToBottom();
      }

      // Update the appropriate chat list (regular or requests)
      if (chatInRegular) {
        setChats(prev => {
          const updatedChats = prev.map(chat => {
            if (chat._id === data.chatId) {
              return {
                ...chat,
                lastMessage: {
                  sender: data.message.sender._id,
                  message: data.message.message,
                  timestamp: data.message.timestamp
                },
                lastMessageAt: data.message.timestamp,
                unreadCount: data.chatId !== selectedChatRef.current ? (chat.unreadCount || 0) + 1 : 0
              };
            }
            return chat;
          });

          return updatedChats.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        });
      } else if (chatInRequests) {
        setMessageRequests(prev => {
          return prev.map(request =>
            request._id === data.chatId
              ? {
                  ...request,
                  lastMessage: {
                    sender: data.message.sender._id,
                    message: data.message.message,
                    timestamp: data.message.timestamp
                  },
                  lastMessageAt: data.message.timestamp
                }
              : request
          );
        });
      }
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
    
    // If there's a file selected, send file message instead
    if (selectedFile) {
      await handleSendFileMessage();
      return;
    }
    
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

  // Emoji picker handlers
  const handleEmojiClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    messageInputRef.current?.focus();
  };

  // File handling functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Restrict to images and videos only
    if (!(file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      alert('Only image and video files are allowed.');
      return;
    }

    // Check file size (limit to 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert('File size should not exceed 50MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    // Clear the input value so the same file can be selected again
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Send file message
  const handleSendFileMessage = async () => {
    if (!selectedFile || !selectedChat || uploadingFile) return;

    try {
      setUploadingFile(true);
      const message = await messageAPI.sendMessageWithFile(
        selectedChat, 
        selectedFile, 
        newMessage.trim() || undefined
      );
      
      // Add message immediately from API response
      setMessages(prev => {
        const messageExists = prev.some(msg => msg._id === message._id);
        if (messageExists) return prev;
        return [...prev, message];
      });
      
      // Update chat list
      setChats(prev => {
        const updatedChats = prev.map(chat => 
          chat._id === selectedChat 
            ? { 
                ...chat, 
                lastMessage: { 
                  sender: message.sender._id, 
                  message: message.message, 
                  timestamp: message.timestamp 
                }, 
                lastMessageAt: message.timestamp 
              }
            : chat
        );
        return updatedChats.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      });
      
      // Clear file and message
      setSelectedFile(null);
      setFilePreview(null);
      setNewMessage("");
      
      scrollToBottom();
      
    } catch (error: any) {
      console.error('Failed to send file:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 'Failed to send file. Please try again.';
      alert(`Failed to send file: ${errorMessage}`);
    } finally {
      setUploadingFile(false);
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

  // Render media content based on message type
  const renderMediaContent = (msg: Message) => {
    // For media messages, extract the Cloudinary URL from the message
    if (!msg.message || msg.messageType === 'text') return null;

    // Debug log to check message type
    console.log('Rendering media content:', {
      messageType: msg.messageType,
      fileName: msg.fileName,
      fileSize: msg.fileSize,
      message: msg.message
    });

    // Use mediaUrl field if available, otherwise extract URL from message
    let mediaUrl = msg.mediaUrl;
    
    if (!mediaUrl) {
      // Fallback: Extract URL from message (could be just the URL or text + URL)
      const urlRegex = /https?:\/\/[^\s]+/;
      const urlMatch = msg.message.match(urlRegex);
      
      if (!urlMatch) return null;
      
      mediaUrl = urlMatch[0];
    }
    const commonClasses = "max-w-full rounded-lg border border-gray-200";

    switch (msg.messageType) {
      case 'image':
        // Extra check to ensure PDFs don't get rendered as images
        const isActuallyPDF = mediaUrl.includes('.pdf') || (msg.fileName && msg.fileName.toLowerCase().endsWith('.pdf'));
        
        if (isActuallyPDF) {
          // Render as file if it's actually a PDF
          const fileName = msg.fileName || 'Document.pdf';
          return (
            <div className="mb-2">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg border-l-4 border-blue-500 max-w-xs">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileName}
                    </p>
                    <p className="text-xs opacity-75 uppercase">
                      PDF file
                    </p>
                    {msg.fileSize && (
                      <p className="text-xs opacity-75">
                        {(msg.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => window.open(mediaUrl, '_blank')}
                    className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                  >
                    View PDF
                  </button>
                  <a
                    href={mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                  >
                    Open in New Tab
                  </a>
                </div>
              </div>
            </div>
          );
        }
        
        // Normal image rendering
        return (
          <div className="mb-2">
            <img
              src={mediaUrl}
              alt={msg.fileName || 'Shared image'}
              className={`${commonClasses} object-cover cursor-pointer hover:opacity-90 transition-opacity max-w-[300px] max-h-[200px]`}
              onClick={() => window.open(mediaUrl, '_blank')}
              onError={(e) => {
                console.error('Image failed to load:', mediaUrl);
                // If image fails to load, maybe it's actually a file
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        );

      case 'video':
        return (
          <div className="mb-2">
            <video
              src={mediaUrl}
              controls
              className={`${commonClasses} max-h-64`}
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="mb-2">
            <audio
              src={mediaUrl}
              controls
              className="w-full max-w-sm"
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );

      case 'file':
        // Extract filename from URL if not provided
        let fileName = msg.fileName;
        if (!fileName) {
          const urlParts = mediaUrl.split('/');
          const lastPart = urlParts[urlParts.length - 1];
          // Try to extract a meaningful filename
          if (lastPart.includes('.')) {
            fileName = lastPart.split('.')[0] + '.' + lastPart.split('.').pop();
          } else {
            fileName = 'File';
          }
        }
        
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        const isPDF = fileExtension === 'pdf' || mediaUrl.includes('.pdf');
        const isDoc = ['doc', 'docx'].includes(fileExtension);
        const isExcel = ['xls', 'xlsx'].includes(fileExtension);
        const isPowerPoint = ['ppt', 'pptx'].includes(fileExtension);
        
        // Choose appropriate icon
        let fileIcon = '📄'; // Default document icon
        if (isPDF) fileIcon = '📄';
        else if (isDoc) fileIcon = '📝';
        else if (isExcel) fileIcon = '📊';
        else if (isPowerPoint) fileIcon = '📊';
        else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(fileExtension)) fileIcon = '🗜️';
        else if (['txt', 'csv'].includes(fileExtension)) fileIcon = '📝';

        return (
          <div className="mb-2">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg border-l-4 border-blue-500 max-w-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{fileIcon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {fileName}
                  </p>
                  <p className="text-xs opacity-75 uppercase">
                    {fileExtension} file
                  </p>
                  {msg.fileSize && (
                    <p className="text-xs opacity-75">
                      {(msg.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                {isPDF ? (
                  <>
                    <button
                      onClick={() => {
                        // For PDFs, open in a new window/tab with proper headers
                        const newWindow = window.open('', '_blank');
                        if (newWindow) {
                          newWindow.document.write(`
                            <html>
                              <head><title>${fileName}</title></head>
                              <body style="margin:0;padding:0;">
                                <iframe src="${mediaUrl}" width="100%" height="100%" style="border:none;"></iframe>
                              </body>
                            </html>
                          `);
                        } else {
                          // Fallback: direct link
                          window.location.href = mediaUrl;
                        }
                      }}
                      className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      View PDF
                    </button>
                    <button
                      onClick={() => {
                        // Create a temporary link to download
                        const link = document.createElement('a');
                        link.href = mediaUrl;
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                    >
                      Open in New Tab
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = mediaUrl;
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = mediaUrl;
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                    >
                      Open in New Tab
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Filter chats based on search query and tab
  const filteredChats = (() => {
    // Get the appropriate chat list based on active tab
    let chatList: Chat[] = [];
    
    if (activeTab === 'requests') {
      chatList = messageRequests;
    } else {
      chatList = chats.filter(chat => {
        if (activeTab === 'direct' && chat.chatType !== 'direct') return false;
        if (activeTab === 'group' && chat.chatType !== 'group') return false;
        return true;
      });
    }
    
    // Filter by search query
    if (!searchQuery.trim()) return chatList;
    
    const searchLower = searchQuery.toLowerCase();
    return chatList.filter(chat => {
      const chatName = getChatDisplayName(chat).toLowerCase();
      const lastMessage = chat.lastMessage?.message?.toLowerCase() || '';
      return chatName.includes(searchLower) || lastMessage.includes(searchLower);
    });
  })();

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
      setFollowingUsers((following || []).filter(user => user && user._id));
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

  // Accept message request with auto-follow
  const handleAcceptRequest = async (chatId: string) => {
    const request = messageRequests.find(r => r._id === chatId);
    if (!request || !user) return;

    try {
      // Get the other participant
      const otherParticipant = request.participants.filter(p => p && p._id).find(p => p._id !== user._id);
      
      if (!otherParticipant) {
        // Try to get participant from lastMessage sender as fallback
        if (request.lastMessage?.sender && request.lastMessage.sender !== user._id) {
          const senderID = request.lastMessage.sender;
          
          // Accept the request on the server
          await messageAPI.acceptMessageRequest(chatId);
          
          // Auto-follow the user
          await messageAPI.followUser(senderID);
          
          // Update local following list
          setUserFollowingList(prev => [...prev, senderID]);

          // Move from requests to regular chats
          setChats(prev => [request, ...prev]);
          setMessageRequests(prev => prev.filter(r => r._id !== chatId));

          // Cache decision
          const newDecisions = new Map(requestDecisionCache);
          newDecisions.set(chatId, 'accepted');
          setRequestDecisionCache(newDecisions);

          // Persist decision
          localStorage.setItem(REQUEST_DECISIONS_KEY, 
            JSON.stringify(Array.from(newDecisions.entries())));

          // Load messages for this chat and select it
          try {
            const response = await messageAPI.getChatMessages(chatId);
            setMessages(response.messages);
            setSelectedChat(chatId);
            setActiveTab('direct');
          } catch (error) {
            console.error('Failed to load messages:', error);
          }

          return;
        }
        
        throw new Error('Cannot find the other participant to accept request');
      }

      // Accept the request on the server
      await messageAPI.acceptMessageRequest(chatId);
      
      // Auto-follow the user
      await messageAPI.followUser(otherParticipant._id);
      
      // Update local following list
      setUserFollowingList(prev => [...prev, otherParticipant._id]);

      // Move from requests to regular chats
      setChats(prev => [request, ...prev]);
      setMessageRequests(prev => prev.filter(r => r._id !== chatId));

      // Cache decision
      const newDecisions = new Map(requestDecisionCache);
      newDecisions.set(chatId, 'accepted');
      setRequestDecisionCache(newDecisions);

      // Persist decision
      localStorage.setItem(REQUEST_DECISIONS_KEY, 
        JSON.stringify(Array.from(newDecisions.entries())));

      // Load messages for this chat and select it
      try {
        const response = await messageAPI.getChatMessages(chatId);
        setMessages(response.messages);
        setSelectedChat(chatId);
        setActiveTab('direct');
      } catch (error) {
        console.error('Failed to load messages:', error);
      }

    } catch (error) {
      console.error('Failed to accept request:', error);
      alert(`Failed to accept request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Decline message request
  const handleDeclineRequest = async (chatId: string) => {
    try {
      // Decline the request on the server
      await messageAPI.declineMessageRequest(chatId);
      
      // Remove from local requests
      setMessageRequests(prev => prev.filter(r => r._id !== chatId));

      // Cache decline decision
      const newDecisions = new Map(requestDecisionCache);
      newDecisions.set(chatId, 'declined');
      setRequestDecisionCache(newDecisions);

      // Persist decision
      localStorage.setItem(REQUEST_DECISIONS_KEY, 
        JSON.stringify(Array.from(newDecisions.entries())));

    } catch (error) {
      console.error('Failed to decline request:', error);
      alert(`Failed to decline request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle when user follows/unfollows someone from other parts of the app
  const handleUserFollowUpdate = (userId: string, isFollowing: boolean) => {
    console.log(`Follow update: ${userId}, following: ${isFollowing}`);
    
    // Update the following list
    setUserFollowingList(prev => {
      const newList = isFollowing 
        ? (prev.includes(userId) ? prev : [...prev, userId])
        : prev.filter(id => id !== userId);
      
      console.log('Updated following list:', newList);
      return newList;
    });

    // The recategorization will happen automatically via useEffect
    // when userFollowingList changes
  };

  // Expose the follow update handler globally for other components to use
  useEffect(() => {
    // Subscribe to follow events
    const unsubscribe = followEvents.subscribe(handleUserFollowUpdate);
    
    return unsubscribe;
  }, [userFollowingList, chats, messageRequests, requestDecisionCache]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

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
              {/* <Bell className="w-5 h-5" /> */}
              {/* <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div> */}
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
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="w-4 h-4" />
              Requests
              {messageRequests.length > 0 && (
                <span className="bg-orange-500 text-white text-xs min-w-[18px] h-4 flex items-center justify-center rounded-full px-1">
                  {messageRequests.length > 99 ? '99+' : messageRequests.length}
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
                {searchQuery.trim() 
                  ? `No ${activeTab === 'requests' ? 'requests' : 'chats'} found matching your search` 
                  : activeTab === 'requests' 
                    ? 'No message requests'
                    : activeTab === 'group'
                      ? 'No group chats available'
                      : 'No direct chats available'
                }
              </div>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div 
                key={chat._id} 
                className={`flex items-start gap-3 p-3 rounded-lg transition ${
                  activeTab === 'requests' 
                    ? "hover:bg-orange-50" 
                    : `cursor-pointer hover:bg-yellow-50 ${selectedChat === chat._id ? "bg-yellow-50 border border-yellow-300" : ""}`
                }`} 
                onClick={() => {
                  if (activeTab !== 'requests') {
                    console.log('Selecting chat:', chat._id);
                    setSelectedChat(chat._id);
                  }
                }}
              >
                <Image src={getChatAvatar(chat)} alt={getChatDisplayName(chat)} width={48} height={48} className="rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-black">{getChatDisplayName(chat)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activeTab === 'requests' 
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {activeTab === 'requests' ? 'Request' : (chat.chatType === 'group' ? 'Group' : 'Direct')}
                    </span>
                    <span className="ml-auto text-xs text-gray-400">{formatTime(chat.lastMessageAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {(() => {
                      const msg = chat.lastMessage?.message;
                      if (!msg) return 'No messages yet';
                      // Find the first URL in the message
                      const urlRegex = /https?:\/\/[^\s]+/g;
                      const urls = msg.match(urlRegex);
                      if (urls && urls.length > 0) {
                        const url = urls[0];
                        // Check if it's a Cloudinary URL
                        const isCloudinary = url.includes('res.cloudinary.com');
                        const imageExt = /(\.jpg|\.jpeg|\.png|\.gif|\.webp|\.bmp|\.svg)$/i;
                        const videoExt = /(\.mp4|\.mov|\.webm|\.avi|\.mkv|\.flv|\.wmv)$/i;
                        if (isCloudinary) {
                          if (imageExt.test(url)) return 'Image';
                          if (videoExt.test(url)) return 'Video';
                        } else {
                          // YouTube preview
                          const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
                          if (ytMatch && ytMatch[1]) {
                            const videoId = ytMatch[1];
                            return (
                              <span className="flex items-center gap-2">
                                <img
                                  src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
                                  alt="YouTube thumbnail"
                                  className="w-8 h-8 rounded object-cover border"
                                  style={{ display: 'inline-block' }}
                                />
                                <span className="truncate">YouTube Video</span>
                              </span>
                            );
                          }
                          // Generic link preview (favicon + domain)
                          try {
                            const { hostname } = new URL(url);
                            return (
                              <span className="flex items-center gap-2">
                                <img
                                  src={`https://www.google.com/s2/favicons?domain=${hostname}`}
                                  alt="Favicon"
                                  className="w-5 h-5 rounded"
                                  style={{ display: 'inline-block' }}
                                />
                                <span className="truncate">{hostname}</span>
                              </span>
                            );
                          } catch {
                            return 'Attachment';
                          }
                        }
                      }
                      // If the message contains a URL, remove it for preview
                      const textWithoutUrl = msg.replace(urlRegex, '').trim();
                      return textWithoutUrl || 'No messages yet';
                    })()}
                  </p>
                  
                  {/* Request Actions */}
                  {activeTab === 'requests' && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptRequest(chat._id);
                        }}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-full transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeclineRequest(chat._id);
                        }}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-full transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
                {activeTab !== 'requests' && (chat.unreadCount ?? 0) > 0 && (
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
                  className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
                  onClick={() => handleProfileClick(selected)}
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
                          ? `${selected.participants.length} members • Click to view details`
                          : 'Click to view profile'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-gray-500">
                  {/* <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button> */}
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
                      
                      {/* Render media content */}
                      {renderMediaContent(msg)}
                      
                      {/* Render text message or video preview if YouTube link */}
                      {msg.message && (() => {
                        const urlRegex = /https?:\/\/[^\s]+/g;
                        const urls = msg.message.match(urlRegex);
                        if (urls && urls.length > 0) {
                          const url = urls[0];
                          // YouTube video embed
                          const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
                          if (ytMatch && ytMatch[1]) {
                            const videoId = ytMatch[1];
                            return (
                              <div className="my-2">
                                <iframe
                                  width="320"
                                  height="180"
                                  src={`https://www.youtube.com/embed/${videoId}`}
                                  title="YouTube video player"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="rounded-lg border"
                                ></iframe>
                              </div>
                            );
                          }
                        }
                        // For media messages, only show the caption text (not the URL)
                        if (msg.messageType !== 'text') {
                          const urlRegex = /https?:\/\/[^\s]+/;
                          const textWithoutUrl = msg.message.replace(urlRegex, '').trim();
                          return textWithoutUrl && <p>{textWithoutUrl}</p>;
                        }
                        // For text messages, show the full message
                        return <p>{msg.message}</p>;
                      })()}  
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
            <div className="p-4 border-t border-gray-200 bg-white relative">
              {/* File Preview */}
              {selectedFile && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {filePreview ? (
                        <Image
                          src={filePreview}
                          alt="File preview"
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <Paperclip className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                {/* File Upload Button */}
                <button 
                  type="button" 
                  onClick={handleFileUpload}
                  disabled={uploadingFile}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,video/*"
                />

                <div className="relative flex-1">
                  <input 
                    ref={messageInputRef}
                    type="text" 
                    placeholder={selectedFile ? "Add a caption (optional)..." : "Type a message..."} 
                    value={newMessage}
                    onChange={handleInputChange}
                    disabled={sendingMessage || uploadingFile}
                    className="w-full py-3 px-4 pr-10 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 text-black placeholder-gray-400" 
                  />
                  <button 
                    type="button" 
                    onClick={handleEmojiClick}
                    disabled={uploadingFile}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors disabled:opacity-50 ${
                      showEmojiPicker 
                        ? 'text-yellow-500 hover:text-yellow-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={(!newMessage.trim() && !selectedFile) || sendingMessage || uploadingFile}
                  className="p-3 bg-[#DBB42C] hover:bg-yellow-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingFile ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div ref={emojiPickerRef} className="absolute bottom-full right-4 mb-2 z-50">
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      width={350}
                      height={400}
                      searchDisabled={false}
                      skinTonesDisabled={false}
                      previewConfig={{
                        showPreview: true
                      }}
                      emojiStyle={EmojiStyle.GOOGLE}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <MessageSquare className="mx-auto mb-4 w-10 h-10 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-800">Select a conversation</h3>
            <p className="text-gray-500 mt-1">Choose a conversation to start messaging</p>
            <button 
              onClick={handleNewChat}
              className="mt-4 bg-button-gradient text-white px-4 py-2 rounded-lg hover:bg-yellow-500 cursor-pointer"
            >
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
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
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
                  {followingUsers.filter(followingUser => followingUser && followingUser._id).map((followingUser) => (
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
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
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
                    {followingUsers.filter(followingUser => followingUser && followingUser._id).map((followingUser) => (
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
                  {selected.participants.filter(participant => participant && participant._id).map((participant) => (
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
                          {participant._id === selected.createdBy?._id && (
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