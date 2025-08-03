import { useState, useEffect, useRef } from 'react';
import { messageAPI, Message, Chat } from '@/api/message';
import socketManager from '@/utils/socket';

interface UseMessageManagementProps {
  selectedChat: string | null;
  user: any;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}

export const useMessageManagement = ({ selectedChat, user, setChats }: UseMessageManagementProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [showContextMenu, setShowContextMenu] = useState<{messageId: string, x: number, y: number} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Typing indicators
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    
    if (messages.length > 0) {
      const latestMessages = messages.slice(-5);
      markUnreadMessagesAsSeen(latestMessages);
    }
  }, [messages]);

  // Load messages when chat is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat) return;

      try {
        const response = await messageAPI.getChatMessages(selectedChat);
        setMessages(response.messages);
        socketManager.joinChat(selectedChat);
        
        await messageAPI.markMessagesRead(selectedChat);
        
        setChats(prev => prev.map(chat => 
          chat._id === selectedChat 
            ? { ...chat, unreadCount: 0 }
            : chat
        ));
        
        markUnreadMessagesAsSeen(response.messages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();

    return () => {
      if (selectedChat) {
        stopTypingIndicator();
        socketManager.leaveChat(selectedChat);
      }
    };
  }, [selectedChat]);

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
        threshold: 0.8,
      }
    );

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
    setNewMessage("");
    
    await stopTypingIndicator();
    
    try {
      setSendingMessage(true);
      const message = await messageAPI.sendMessage(selectedChat, messageText);
      
      console.log('API: Adding message from API response', message._id);
      setMessages(prev => {
        const messageExists = prev.some(msg => msg._id === message._id);
        console.log('API: Message exists?', messageExists, 'Message ID:', message._id);
        if (messageExists) {
          console.log('API: Skipping duplicate message');
          return prev;
        }
        console.log('API: Adding new message to state');
        return [...prev, message];
      });
      
      setChats(prev => {
        const updatedChats = prev.map(chat => 
          chat._id === selectedChat 
            ? { ...chat, lastMessage: { sender: message.sender._id, message: message.message, timestamp: message.timestamp }, lastMessageAt: message.timestamp }
            : chat
        );
        
        return updatedChats.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      });
      
      scrollToBottom();
      
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
      
    } catch (error) {
      console.error('Failed to send message:', error);
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
      return;
    }
    
    try {
      await messageAPI.markMessagesRead(selectedChat, [messageId]);
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
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      socketManager.deleteMessage(selectedChat, messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message');
    }
    setShowContextMenu(null);
  };

  // Handle typing indicators with API calls
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (selectedChat) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        messageAPI.startTyping(selectedChat).catch(console.error);
        socketManager.startTyping(selectedChat);
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(async () => {
        if (isTypingRef.current) {
          isTypingRef.current = false;
          try {
            await messageAPI.stopTyping(selectedChat);
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

  // Cleanup typing indicators on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTypingIndicator();
    };
  }, []);

  return {
    // State
    messages,
    setMessages,
    sendingMessage,
    newMessage,
    setNewMessage,
    typingUsers,
    setTypingUsers,
    showContextMenu,
    setShowContextMenu,
    
    // Refs
    messagesEndRef,
    messageInputRef,
    messagesContainerRef,
    
    // Functions
    handleSendMessage,
    handleDeleteMessage,
    handleInputChange,
    scrollToBottom,
    markUnreadMessagesAsSeen,
    stopTypingIndicator
  };
};