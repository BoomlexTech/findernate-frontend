import React from 'react';
import Image from 'next/image';
import { ChatTabs } from './ChatTabs';
import { ChatList } from './ChatList';
import { Chat } from '@/api/message';

type TabType = 'direct' | 'group' | 'requests';

interface LeftPanelProps {
  user: any;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  directUnreadCount: number;
  groupUnreadCount: number;
  requestCount: number;
  onNewChat: () => void;
  onNewGroup: () => void;
  chats: Chat[];
  selectedChat: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSelectedChat: (chatId: string) => void;
  getChatAvatar: (chat: Chat) => string;
  getChatDisplayName: (chat: Chat) => string;
  formatTime: (timestamp: string) => string;
  onAcceptRequest?: (chatId: string) => void;
  onDeclineRequest?: (chatId: string) => void;
  loading: boolean;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  user,
  activeTab,
  setActiveTab,
  directUnreadCount,
  groupUnreadCount,
  requestCount,
  onNewChat,
  onNewGroup,
  chats,
  selectedChat,
  searchQuery,
  setSearchQuery,
  setSelectedChat,
  getChatAvatar,
  getChatDisplayName,
  formatTime,
  onAcceptRequest,
  onDeclineRequest,
  loading
}) => {
  return (
    <div className="w-1/3 border-r bg-white flex flex-col">
      <div className="flex items-center justify-between p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-600 mt-1">Connect with businesses and users</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            {/* Future: Notifications */}
          </button>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500">Personal Account</p>
            </div>
            {user?.profileImageUrl && (
              <Image 
                width={10} 
                height={10} 
                src={user?.profileImageUrl} 
                alt="User Avatar" 
                className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400" 
              />
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pt-4">
        <ChatTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          directUnreadCount={directUnreadCount}
          groupUnreadCount={groupUnreadCount}
          requestCount={requestCount}
        />

        <div className="flex gap-2">
          <button 
            onClick={onNewChat}
            className="flex-1 bg-button-gradient text-white py-2.5 rounded-lg font-medium shadow hover:bg-yellow-500 transition cursor-pointer"
          >
            + New Chat
          </button>
          <button 
            onClick={onNewGroup}
            className="flex-1 bg-green-500 text-white py-2.5 rounded-lg font-medium shadow hover:bg-green-600 transition cursor-pointer"
          >
            + New Group
          </button>
        </div>
      </div>

      <ChatList
        chats={chats}
        selectedChat={selectedChat}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setSelectedChat={setSelectedChat}
        activeTab={activeTab}
        getChatAvatar={getChatAvatar}
        getChatDisplayName={getChatDisplayName}
        formatTime={formatTime}
        onAcceptRequest={onAcceptRequest}
        onDeclineRequest={onDeclineRequest}
        loading={loading}
      />
    </div>
  );
};