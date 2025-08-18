import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { messageAPI, Chat, Message } from '@/api/message';
import socketManager from '@/utils/socket';
import { requestChatCache } from '@/utils/requestChatCache';

interface UseSocketProps {
  selectedChat: string | null;
  user: any;
  chats: Chat[];
  messageRequests: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setMessageRequests: React.Dispatch<React.SetStateAction<Chat[]>>;
  setAllChatsCache: React.Dispatch<React.SetStateAction<Chat[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setTypingUsers: React.Dispatch<React.SetStateAction<Map<string, string>>>;
  scrollToBottom: () => void;
  isIncomingRequest: (chat: Chat, currentUserId: string) => boolean;
}

export const useSocket = ({
  selectedChat,
  user,
  chats,
  messageRequests,
  setChats,
  setMessageRequests,
  setAllChatsCache,
  setMessages,
  setTypingUsers,
  scrollToBottom,
  isIncomingRequest
}: UseSocketProps) => {
  const router = useRouter();
  const selectedChatRef = useRef<string | null>(null);

  // Update ref when selectedChat changes
  useEffect(() => {
    console.log('selectedChat changed to:', selectedChat);
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Initialize socket connection
  useEffect(() => {
    const { validateAndGetToken, logout } = useUserStore.getState();
    const validToken = validateAndGetToken();
    
    if (validToken) {
      socketManager.connect(validToken);
    } else {
      console.warn('No valid token for socket connection');
    }

    const handleAuthFailure = (data: any) => {
      console.error('Permanent authentication failure:', data.message);
      alert('Your session has expired. Please log in again.');
      logout();
      router.push('/signin');
    };

    const handleConnectionFailure = (data: any) => {
      console.error('Permanent connection failure:', data.message);
    };

    socketManager.on('auth_failure_permanent', handleAuthFailure);
    socketManager.on('connection_failed_permanent', handleConnectionFailure);

    return () => {
      socketManager.off('auth_failure_permanent', handleAuthFailure);
      socketManager.off('connection_failed_permanent', handleConnectionFailure);
      socketManager.disconnect();
    };
  }, [router]);

  // Socket event handlers
  useEffect(() => {
    const handleNewMessage = (data: { chatId: string; message: Message }) => {
      const chatInRegular = chats.find(c => c._id === data.chatId);
      const chatInRequests = messageRequests.find(r => r._id === data.chatId);
      const chat = chatInRegular || chatInRequests;
      
      if (!chat) {
        console.log('New message from unknown chat, reloading chats...');
        if (user) {
          Promise.all([
            messageAPI.getActiveChats(),
            messageAPI.getMessageRequests()
          ]).then(([activeChatsResponse, requestsResponse]) => {
            const sortedActiveChats = activeChatsResponse.chats.sort((a, b) => 
              new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
            );
            
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
          
          // If this is a request chat that we're currently viewing, update the cache as well
          const chatInRequests = messageRequests.find(r => r._id === data.chatId);
          if (chatInRequests) {
            console.log('Adding message to cache for currently selected request chat');
            requestChatCache.addMessage(data.chatId, data.message);
          }
          
          return [...prev, data.message];
        });
        scrollToBottom();
      }

      // Update the appropriate chat list
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
        // Cache the message for request chats so recipients can see the full conversation
        console.log('Caching message for request chat:', data.chatId, data.message.message);
        requestChatCache.addMessage(data.chatId, data.message);
        
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
            if (data.messageIds.includes(msg._id)) {
              return { ...msg, readBy: [...msg.readBy.filter(id => id !== data.readBy._id), data.readBy._id] };
            }
          } else {
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
  }, [selectedChat, user, chats, messageRequests, setChats, setMessageRequests, setAllChatsCache, setMessages, setTypingUsers, scrollToBottom, isIncomingRequest]);

  return {
    selectedChatRef
  };
};