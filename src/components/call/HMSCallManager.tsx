'use client';

import React, { useState } from 'react';
import { useGlobalHMSCall } from '@/components/providers/GlobalHMSCallProvider';
import { HMSCallModal } from './HMSCallModal';
import { Chat } from '@/api/message';

interface HMSCallManagerProps {
  currentUserId?: string;
}

export const HMSCallManager: React.FC<HMSCallManagerProps> = ({ currentUserId }) => {
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
  } = useGlobalHMSCall();

  const [isMinimized, setIsMinimized] = useState(false);

  console.log('🎯 HMSCallManager: Call state:', callState.isInCall, 'Call:', callState.call?._id, 'IncomingCall:', incomingCall?.callId);

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
        <HMSCallModal
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
export const useHMSCallManager = (currentUserId?: string) => {
  const callManager = useGlobalHMSCall();

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