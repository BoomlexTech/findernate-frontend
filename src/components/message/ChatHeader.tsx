import React from 'react';
import Image from 'next/image';
import { Chat } from '@/api/message';

interface ChatHeaderProps {
  selected: Chat;
  typingUsers: Map<string, string>;
  getChatAvatar: (chat: Chat) => string;
  getChatDisplayName: (chat: Chat) => string;
  onProfileClick: (chat: Chat) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selected,
  typingUsers,
  getChatAvatar,
  getChatDisplayName,
  onProfileClick
}) => {
  return (
    <div className="p-6 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
          onClick={() => onProfileClick(selected)}
        >
          <Image 
            width={12} 
            height={12} 
            src={getChatAvatar(selected)} 
            alt={getChatDisplayName(selected)} 
            className="w-12 h-12 rounded-full object-cover" 
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">{getChatDisplayName(selected)}</h2>
              <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                {selected.chatType === 'group' ? 'Group' : 'Direct'}
              </div>
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
          {/* Future: Add call/video buttons here */}
        </div>
      </div>
    </div>
  );
};