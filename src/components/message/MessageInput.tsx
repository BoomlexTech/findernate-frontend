import React, { useRef } from 'react';
import Image from 'next/image';
import { Send, Paperclip, Smile, Trash2 } from 'lucide-react';
import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';

interface MessageInputProps {
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
}

export const MessageInput: React.FC<MessageInputProps> = ({
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
  fileInputRef
}) => {
  return (
    <div className="p-4 border-t border-gray-200 bg-white relative">
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
              onClick={onRemoveFile}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={onSendMessage} className="flex items-center space-x-2">
        <button 
          type="button" 
          onClick={onFileUpload}
          disabled={uploadingFile}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          onChange={onFileSelect}
          className="hidden"
          accept="image/*,video/*"
        />

        <div className="relative flex-1">
          <input 
            ref={messageInputRef}
            type="text" 
            placeholder={selectedFile ? "Add a caption (optional)..." : "Type a message..."} 
            value={newMessage}
            onChange={onInputChange}
            disabled={sendingMessage || uploadingFile}
            className="w-full py-3 px-4 pr-10 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 text-black placeholder-gray-400" 
          />
          <button 
            type="button" 
            onClick={onEmojiClick}
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

      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-full right-4 mb-2 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <EmojiPicker
              onEmojiClick={onEmojiSelect}
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
  );
};