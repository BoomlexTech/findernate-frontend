import React from 'react';
import Image from 'next/image';
import { Chat } from '@/api/message';
import { ChevronLeft, Phone, Video } from 'lucide-react';

interface ChatHeaderProps {
  selected: Chat;
  typingUsers: Map<string, string>;
  getChatAvatar: (chat: Chat) => string;
  getChatDisplayName: (chat: Chat) => string;
  onProfileClick: (chat: Chat) => void;
  onBack?: () => void;
  onVoiceCall?: (chat: Chat) => void;
  onVideoCall?: (chat: Chat) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selected,
  typingUsers,
  getChatAvatar,
  getChatDisplayName,
  onProfileClick,
  onBack,
  onVoiceCall,
  onVideoCall
}) => {
  return (
    <div className="p-6 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="sm:hidden p-2 mr-2 rounded-full hover:bg-gray-100 text-gray-700"
              aria-label="Back to chats"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
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
        </div>
        <div className="flex items-center space-x-3 text-gray-500">
          {/* Voice Call Button */}
          {onVoiceCall && selected.chatType === 'direct' && (
            <button
              type="button"
              onClick={() => onVoiceCall(selected)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors"
              title="Start voice call"
            >
              <Phone className="w-5 h-5" />
            </button>
          )}
          
          {/* Video Call Button */}
          {onVideoCall && selected.chatType === 'direct' && (
            <button
              type="button"
              onClick={() => onVideoCall(selected)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors"
              title="Start video call"
            >
              <Video className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};