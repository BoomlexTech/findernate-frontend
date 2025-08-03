import React, { useRef } from 'react';
import { Chat, Message } from '@/api/message';
import { ChatHeader } from './ChatHeader';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import { EmojiClickData } from 'emoji-picker-react';

interface RightPanelProps {
  selected: Chat;
  messages: Message[];
  user: any;
  typingUsers: Map<string, string>;
  getChatAvatar: (chat: Chat) => string;
  getChatDisplayName: (chat: Chat) => string;
  onProfileClick: (chat: Chat) => void;
  onContextMenu: (messageId: string, x: number, y: number) => void;
  
  // Message input props
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileUpload: () => void;
  onRemoveFile: () => void;
  onEmojiClick: () => void;
  onEmojiSelect: (emojiData: EmojiClickData) => void;
  sendingMessage: boolean;
  uploadingFile: boolean;
  selectedFile: File | null;
  filePreview: string | null;
  showEmojiPicker: boolean;
  emojiPickerRef: React.RefObject<HTMLDivElement | null>;
  messageInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  selected,
  messages,
  user,
  typingUsers,
  getChatAvatar,
  getChatDisplayName,
  onProfileClick,
  onContextMenu,
  newMessage,
  setNewMessage,
  onSendMessage,
  onInputChange,
  onFileSelect,
  onFileUpload,
  onRemoveFile,
  onEmojiClick,
  onEmojiSelect,
  sendingMessage,
  uploadingFile,
  selectedFile,
  filePreview,
  showEmojiPicker,
  emojiPickerRef,
  messageInputRef,
  fileInputRef,
  messagesEndRef,
  messagesContainerRef
}) => {
  return (
    <div className="flex flex-col w-full h-full">
      <ChatHeader
        selected={selected}
        typingUsers={typingUsers}
        getChatAvatar={getChatAvatar}
        getChatDisplayName={getChatDisplayName}
        onProfileClick={onProfileClick}
      />

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500">No messages yet. Start a conversation!</div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageItem
              key={msg._id}
              msg={msg}
              isCurrentUser={msg.sender._id === user?._id}
              selected={selected}
              user={user}
              onContextMenu={onContextMenu}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSendMessage={onSendMessage}
        onInputChange={onInputChange}
        onFileSelect={onFileSelect}
        onFileUpload={onFileUpload}
        onRemoveFile={onRemoveFile}
        onEmojiClick={onEmojiClick}
        onEmojiSelect={onEmojiSelect}
        sendingMessage={sendingMessage}
        uploadingFile={uploadingFile}
        selectedFile={selectedFile}
        filePreview={filePreview}
        showEmojiPicker={showEmojiPicker}
        emojiPickerRef={emojiPickerRef}
        messageInputRef={messageInputRef}
        fileInputRef={fileInputRef}
      />
    </div>
  );
};