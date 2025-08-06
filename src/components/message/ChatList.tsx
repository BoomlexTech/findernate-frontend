import React from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { Chat } from '@/api/message';

type TabType = 'direct' | 'group' | 'requests';

interface ChatListProps {
  chats: Chat[];
  selectedChat: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSelectedChat: (chatId: string) => void;
  activeTab: TabType;
  getChatAvatar: (chat: Chat) => string;
  getChatDisplayName: (chat: Chat) => string;
  formatTime: (timestamp: string) => string;
  onAcceptRequest?: (chatId: string) => void;
  onDeclineRequest?: (chatId: string) => void;
  loading: boolean;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChat,
  searchQuery,
  setSearchQuery,
  setSelectedChat,
  activeTab,
  getChatAvatar,
  getChatDisplayName,
  formatTime,
  onAcceptRequest,
  onDeclineRequest,
  loading
}) => {
  const renderChatPreview = (chat: Chat) => {
    const msg = chat.lastMessage?.message;
    if (!msg) return 'No messages yet';
    
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = msg.match(urlRegex);
    if (urls && urls.length > 0) {
      const url = urls[0];
      const isCloudinary = url.includes('res.cloudinary.com');
      const imageExt = /(\.jpg|\.jpeg|\.png|\.gif|\.webp|\.bmp|\.svg)$/i;
      const videoExt = /(\.mp4|\.mov|\.webm|\.avi|\.mkv|\.flv|\.wmv)$/i;
      
      if (isCloudinary) {
        if (imageExt.test(url)) return 'Image';
        if (videoExt.test(url)) return 'Video';
      } else {
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
    
    const textWithoutUrl = msg.replace(urlRegex, '').trim();
    const maxLength = 50; // Limit message preview to 50 characters
    if (textWithoutUrl.length > maxLength) {
      return textWithoutUrl.substring(0, maxLength) + '...';
    }
    return textWithoutUrl || 'No messages yet';
  };

  return (
    <>
      {/* Search bar - always visible */}
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

      {/* Content area */}
      <div className="overflow-y-auto px-4 flex-1">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Loading chats...</div>
          </div>
        ) : chats.length === 0 ? (
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
          chats.map((chat) => (
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
              <Image 
                src={getChatAvatar(chat)} 
                alt={getChatDisplayName(chat)} 
                width={48} 
                height={48} 
                className="rounded-full" 
              />
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
                <p className="text-sm text-gray-600 truncate max-w-[200px] overflow-hidden whitespace-nowrap">
                  {renderChatPreview(chat)}
                </p>
                
                {activeTab === 'requests' && onAcceptRequest && onDeclineRequest && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAcceptRequest(chat._id);
                      }}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-full transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeclineRequest(chat._id);
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
    </>
  );
};