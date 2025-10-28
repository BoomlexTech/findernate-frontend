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
    <div className="p-3 sm:p-6 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center min-w-0 flex-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="sm:hidden p-2 mr-1 rounded-full hover:bg-gray-100 text-gray-700 flex-shrink-0"
              aria-label="Back to chats"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div
            className="flex items-center space-x-2 sm:space-x-4 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors min-w-0 flex-1"
            onClick={() => onProfileClick(selected)}
          >
          <Image
            width={12}
            height={12}
            src={getChatAvatar(selected)}
            alt={getChatDisplayName(selected)}
            className="w-9 h-9 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{getChatDisplayName(selected)}</h2>
              <div className="hidden sm:block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
                {selected.chatType === 'group' ? 'Group' : 'Direct'}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
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
        <div className="flex items-center space-x-2 sm:space-x-5 sm:pr-8 flex-shrink-0">
          {/* Voice Call Button */}
          {onVoiceCall && selected.chatType === 'direct' && (
            <button
              type="button"
              onClick={() => onVoiceCall(selected)}
              className="group relative p-2 sm:p-3 rounded-full bg-gradient-to-r from-yellow-50 to-yellow-50 hover:from-yellow-100 hover:to-yellow-100 text-yellow-600 hover:text-yellow-700 transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg active:scale-95 border border-yellow-200 hover:border-yellow-300"
              title="Start voice call"
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12" />
              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              {/* Pulse animation on hover */}
              <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-0 group-hover:opacity-20 animate-ping"></div>
            </button>
          )}

          {/* Video Call Button */}
          {onVideoCall && selected.chatType === 'direct' && (
            <button
              type="button"
              onClick={() => onVideoCall(selected)}
              className="group relative p-2 sm:p-3 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-600 hover:text-blue-700 transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg active:scale-95 border border-blue-200 hover:border-blue-300"
              title="Start video call"
            >
              <Video className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12" />
              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              {/* Pulse animation on hover */}
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 animate-ping"></div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};