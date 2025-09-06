'use client';

import React, { useState } from 'react';
import { useGlobalCall } from '@/components/providers/GlobalCallProvider';
import { CallModal } from './CallModal';
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
    toggleVideo,
    localStream,
    remoteStream
  } = useGlobalCall();

  const [isMinimized, setIsMinimized] = useState(false);

  //console.log('🎯 CallManager: Call state:', callState.isInCall, 'Call:', callState.call?._id, 'IncomingCall:', incomingCall?.callId);

  // Helper function to get the other participant ID
  const getOtherParticipantId = (chat: Chat): string => {
    if (!currentUserId) return '';
    
    return chat.participants.find(p => p._id !== currentUserId)?._id || '';
  };

  // Helper function to get other participant info
  const getOtherParticipant = (chat: Chat) => {
    if (!currentUserId) return null;
    
    return chat.participants.find(p => p._id !== currentUserId) || null;
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
      {/* Active Call Modal - Only show when there's an active call */}
      {callState.isInCall && callState.call && (
        <CallModal
          callState={callState}
          isLoading={isLoading}
          currentUser={{ _id: currentUserId }}
          onEndCall={endCall}
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
  const callManager = useGlobalCall();

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