import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { messageAPI, Chat } from '@/api/message';
import { getFollowing } from '@/api/user';
import { AxiosError } from 'axios';
import { followEvents } from '@/utils/followEvents';
import { isIncomingRequest, getChatDisplayName, getChatAvatar, formatTime, calculateUnreadCounts } from '@/utils/message/chatUtils';

const REQUEST_DECISIONS_KEY = 'message_request_decisions';

interface UseChatManagementProps {
  user: any;
}

export const useChatManagement = ({ user }: UseChatManagementProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messageRequests, setMessageRequests] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'direct' | 'group' | 'requests'>('direct');
  const [allChatsCache, setAllChatsCache] = useState<Chat[]>([]);
  const [userFollowingList, setUserFollowingList] = useState<string[]>([]);
  const [requestDecisionCache, setRequestDecisionCache] = useState<Map<string, 'accepted' | 'declined'>>(new Map());
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const selected = chats.find((chat) => chat._id === selectedChat);

  // Load cached decisions and user following list on mount
  useEffect(() => {
    const savedDecisions = localStorage.getItem(REQUEST_DECISIONS_KEY);
    if (savedDecisions) {
      try {
        const decisionsArray = JSON.parse(savedDecisions);
        setRequestDecisionCache(new Map(decisionsArray));
      } catch (error) {
        console.error('Error loading cached decisions:', error);
      }
    }

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
        
        const [activeChatsResponse, requestsResponse] = await Promise.all([
          messageAPI.getActiveChats(),
          messageAPI.getMessageRequests()
        ]);
        
        console.log('Active chats from server:', activeChatsResponse.chats.length);
        console.log('Message requests from server:', requestsResponse.chats.length);
        
        const sortedActiveChats = activeChatsResponse.chats.sort((a, b) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
        
        const filteredRequests = requestsResponse.chats.filter(chat => {
          if (!user?._id) return false;
          return isIncomingRequest(chat, user._id);
        });
        
        console.log('Original requests:', requestsResponse.chats.length);
        console.log('Filtered requests (incoming only):', filteredRequests.length);
        
        const sortedRequests = filteredRequests.sort((a, b) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
        
        setChats(sortedActiveChats);
        setMessageRequests(sortedRequests);
        setAllChatsCache([...sortedActiveChats, ...sortedRequests]);
        
      } catch (error) {
        console.error('Failed to load chats:', error);
        const axiosError = error as AxiosError;
        console.log(axiosError.response?.status);
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
    console.log('Local categorization called with:', allChats.length, 'chats');
    
    const regularChats: Chat[] = [];
    const requestChats: Chat[] = [];

    allChats.forEach((chat) => {
      const decision = requestDecisionCache.get(chat._id);
      
      if (decision === 'declined') {
        return;
      } else if (decision === 'accepted') {
        regularChats.push(chat);
      } else {
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
      const chatExists = chats.find(chat => chat._id === chatId);
      if (chatExists) {
        console.log('Setting selectedChat from URL params:', chatId);
        setSelectedChat(chatId);
      }
    }
  }, [searchParams, chats, selectedChat]);

  // Filter chats based on search query and tab
  const filteredChats = (() => {
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
    
    if (!searchQuery.trim()) return chatList;
    
    const searchLower = searchQuery.toLowerCase();
    return chatList.filter(chat => {
      const chatName = getChatDisplayName(chat, user).toLowerCase();
      const lastMessage = chat.lastMessage?.message?.toLowerCase() || '';
      return chatName.includes(searchLower) || lastMessage.includes(searchLower);
    });
  })();

  // Calculate unread counts
  const { directUnreadCount, groupUnreadCount } = calculateUnreadCounts(chats);

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

  // Create chat with selected user
  const createChatWithUser = async (selectedUser: any) => {
    try {
      if (!user) return;
      
      const participants = [user._id, selectedUser._id];
      const chat = await messageAPI.createChat(participants, 'direct');
      
      setChats(prev => {
        const chatExists = prev.some(c => c._id === chat._id);
        if (chatExists) {
          const updatedChats = prev.filter(c => c._id !== chat._id);
          return [chat, ...updatedChats];
        }
        return [chat, ...prev];
      });
      
      setSelectedChat(chat._id);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  // Accept message request with auto-follow
  const handleAcceptRequest = async (chatId: string) => {
    const request = messageRequests.find(r => r._id === chatId);
    if (!request || !user) return;

    try {
      const otherParticipant = request.participants.filter(p => p && p._id).find(p => p._id !== user._id);
      
      if (!otherParticipant) {
        if (request.lastMessage?.sender && request.lastMessage.sender !== user._id) {
          const senderID = request.lastMessage.sender;
          await messageAPI.acceptMessageRequest(chatId);
          await messageAPI.followUser(senderID);
          setUserFollowingList(prev => [...prev, senderID]);
        } else {
          throw new Error('Cannot find the other participant to accept request');
        }
      } else {
        await messageAPI.acceptMessageRequest(chatId);
        await messageAPI.followUser(otherParticipant._id);
        setUserFollowingList(prev => [...prev, otherParticipant._id]);
      }

      // Move from requests to regular chats
      setChats(prev => [request, ...prev]);
      setMessageRequests(prev => prev.filter(r => r._id !== chatId));

      // Cache decision
      const newDecisions = new Map(requestDecisionCache);
      newDecisions.set(chatId, 'accepted');
      setRequestDecisionCache(newDecisions);

      localStorage.setItem(REQUEST_DECISIONS_KEY, 
        JSON.stringify(Array.from(newDecisions.entries())));

      setSelectedChat(chatId);
      setActiveTab('direct');

    } catch (error) {
      console.error('Failed to accept request:', error);
      alert(`Failed to accept request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Decline message request
  const handleDeclineRequest = async (chatId: string) => {
    try {
      await messageAPI.declineMessageRequest(chatId);
      setMessageRequests(prev => prev.filter(r => r._id !== chatId));

      const newDecisions = new Map(requestDecisionCache);
      newDecisions.set(chatId, 'declined');
      setRequestDecisionCache(newDecisions);

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
    
    setUserFollowingList(prev => {
      const newList = isFollowing 
        ? (prev.includes(userId) ? prev : [...prev, userId])
        : prev.filter(id => id !== userId);
      
      console.log('Updated following list:', newList);
      return newList;
    });
  };

  // Expose the follow update handler globally for other components to use
  useEffect(() => {
    const unsubscribe = followEvents.subscribe(handleUserFollowUpdate);
    return unsubscribe;
  }, [userFollowingList, chats, messageRequests, requestDecisionCache]);

  // Handle profile navigation for direct chats and group details for group chats
  const handleProfileClick = (chat: Chat, setShowGroupDetails?: (show: boolean) => void) => {
    if (chat.chatType === 'direct') {
      const otherParticipant = chat.participants.find(p => p && p._id && p._id !== user?._id);
      if (otherParticipant && otherParticipant.username) {
        router.push(`/userprofile/${otherParticipant.username}`);
      }
    } else if (chat.chatType === 'group' && setShowGroupDetails) {
      setShowGroupDetails(true);
    }
  };

  return {
    // State
    chats,
    setChats,
    messageRequests,
    setMessageRequests,
    selectedChat,
    setSelectedChat,
    loading,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    allChatsCache,
    setAllChatsCache,
    selected,
    filteredChats,
    directUnreadCount,
    groupUnreadCount,
    followingUsers,
    loadingFollowing,
    
    // Functions
    loadFollowingUsers,
    createChatWithUser,
    handleAcceptRequest,
    handleDeclineRequest,
    handleProfileClick,
    
    // Utility functions (re-exported for convenience)
    getChatDisplayName: (chat: Chat) => getChatDisplayName(chat, user),
    getChatAvatar: (chat: Chat) => getChatAvatar(chat, user),
    formatTime,
    isIncomingRequest: (chat: Chat) => isIncomingRequest(chat, user?._id || '')
  };
};