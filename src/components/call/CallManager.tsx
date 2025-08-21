'use client';

import React, { useState } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { CallModal } from './CallModal';
import { IncomingCallModal } from './IncomingCallModal';
import { Chat } from '@/api/message';

interface CallManagerProps {
  currentUserId?: string;
}

export const CallManager: React.FC<CallManagerProps> = ({ currentUserId }) => {
  const {
    callState,
    incomingCall,
    isLoading,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo
  } = useWebRTC();

  const [isMinimized, setIsMinimized] = useState(false);

  // Helper function to get the other participant ID
  const getOtherParticipantId = (chat: Chat): string => {
    if (!currentUserId) return '';
    
    return chat.participants.find(p => p._id !== currentUserId)?._id || '';
  };

  // Handle call initiation
  const handleVoiceCall = async (chat: Chat) => {
    const receiverId = getOtherParticipantId(chat);
    if (receiverId) {
      await initiateCall(receiverId, chat._id, 'voice');
    }
  };

  const handleVideoCall = async (chat: Chat) => {
    const receiverId = getOtherParticipantId(chat);
    if (receiverId) {
      await initiateCall(receiverId, chat._id, 'video');
    }
  };

  return (
    <>
      {/* Incoming Call Modal */}
      {incomingCall && !callState.isInCall && (
        <IncomingCallModal
          incomingCall={incomingCall}
          onAccept={acceptCall}
          onDecline={declineCall}
          isLoading={isLoading}
        />
      )}

      {/* Active Call Modal */}
      {callState.isInCall && (
        <CallModal
          callState={callState}
          incomingCall={incomingCall}
          isLoading={isLoading}
          onEndCall={() => endCall()}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onMinimize={() => setIsMinimized(!isMinimized)}
          isMinimized={isMinimized}
        />
      )}
    </>
  );
};

// Export helper functions for integration with other components
export const useCallManager = (currentUserId?: string) => {
  const callManager = useWebRTC();

  const getCallHandlers = (chat: Chat) => {
    const getOtherParticipantId = (): string => {
      if (!currentUserId) return '';
      return chat.participants.find(p => p._id !== currentUserId)?._id || '';
    };

    return {
      onVoiceCall: async () => {
        const receiverId = getOtherParticipantId();
        if (receiverId) {
          await callManager.initiateCall(receiverId, chat._id, 'voice');
        }
      },
      onVideoCall: async () => {
        const receiverId = getOtherParticipantId();
        if (receiverId) {
          await callManager.initiateCall(receiverId, chat._id, 'video');
        }
      }
    };
  };

  return {
    ...callManager,
    getCallHandlers
  };
};