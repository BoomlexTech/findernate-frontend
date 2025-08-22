'use client';

import React, { useState } from 'react';
import { useCall, CallState } from '@/providers/CallProvider';
import { CallModal } from './CallModal';
import { IncomingCallModal } from './IncomingCallModal';
import { Chat } from '@/api/message';

interface CallManagerProps {
  currentUserId?: string;
}

export const CallManager: React.FC<CallManagerProps> = ({ currentUserId }) => {
  const {
    currentState,
    currentCall,
    incomingCall,
    localStream,
    remoteStream,
    connectionState,
    isAudioEnabled,
    isVideoEnabled,
    callDuration,
    isLoading,
    error,
    startVoiceCall,
    startVideoCall,
    acceptCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo
  } = useCall();

  const [isMinimized, setIsMinimized] = useState(false);
  const [hideIncomingModal, setHideIncomingModal] = useState(false);

  console.log('🎯 CallManager: Current state:', currentState, 'Call:', currentCall?._id, 'IncomingCall:', incomingCall?.callId, 'HideModal:', hideIncomingModal);
  
  // Log when modal should be visible
  const shouldShowIncomingModal = currentState === CallState.INCOMING && incomingCall && !hideIncomingModal;
  console.log('👀 CallManager: Should show incoming modal:', shouldShowIncomingModal);

  // Reset hide state when new incoming call arrives
  React.useEffect(() => {
    if (currentState === CallState.INCOMING && incomingCall) {
      setHideIncomingModal(false);
    }
  }, [currentState, incomingCall]);

  // Wrapper functions to immediately hide modal
  const handleAccept = async () => {
    console.log('✅ CallManager: Accept clicked - hiding modal immediately');
    setHideIncomingModal(true); // Hide modal immediately
    await acceptCall(); // Then handle the actual accept logic
  };

  const handleDecline = async () => {
    console.log('❌ CallManager: Decline clicked - hiding modal immediately');
    setHideIncomingModal(true); // Hide modal immediately  
    await declineCall(); // Then handle the actual decline logic
  };

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
    const otherParticipant = getOtherParticipant(chat);
    
    if (receiverId && otherParticipant) {
      await startVoiceCall(
        receiverId, 
        chat._id, 
        otherParticipant.fullName || otherParticipant.username,
        otherParticipant.profileImageUrl
      );
    }
  };

  const handleVideoCall = async (chat: Chat) => {
    const receiverId = getOtherParticipantId(chat);
    const otherParticipant = getOtherParticipant(chat);
    
    if (receiverId && otherParticipant) {
      await startVideoCall(
        receiverId, 
        chat._id, 
        otherParticipant.fullName || otherParticipant.username,
        otherParticipant.profileImageUrl
      );
    }
  };

  return (
    <>
      {/* Incoming Call Modal - Hide immediately when user clicks Accept/Decline */}
      {shouldShowIncomingModal && (
        <IncomingCallModal
          incomingCall={incomingCall}
          onAccept={handleAccept}
          onDecline={handleDecline}
          isLoading={isLoading}
        />
      )}

      {/* Active Call Modal */}
      {[CallState.CALLING, CallState.CONNECTING, CallState.CONNECTED, CallState.FAILED].includes(currentState) && currentCall && (
        <CallModal
          callState={{
            call: currentCall,
            localStream,
            remoteStream,
            isInCall: ![CallState.FAILED, CallState.ENDED].includes(currentState),
            isInitiator: true, // We can determine this from the call data
            connectionState,
            callStats: null, // We can add this later
            isAudioEnabled,
            isVideoEnabled,
            error
          }}
          isLoading={isLoading || currentState === CallState.CALLING || currentState === CallState.CONNECTING}
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
  const callManager = useCall();

  const getCallHandlers = (chat: Chat) => {
    const getOtherParticipantId = (): string => {
      if (!currentUserId) return '';
      return chat.participants.find(p => p._id !== currentUserId)?._id || '';
    };

    const getOtherParticipant = () => {
      if (!currentUserId) return null;
      return chat.participants.find(p => p._id !== currentUserId) || null;
    };

    return {
      onVoiceCall: async () => {
        const receiverId = getOtherParticipantId();
        const otherParticipant = getOtherParticipant();
        
        if (receiverId && otherParticipant) {
          await callManager.startVoiceCall(
            receiverId, 
            chat._id, 
            otherParticipant.fullName || otherParticipant.username,
            otherParticipant.profileImageUrl
          );
        }
      },
      onVideoCall: async () => {
        const receiverId = getOtherParticipantId();
        const otherParticipant = getOtherParticipant();
        
        if (receiverId && otherParticipant) {
          await callManager.startVideoCall(
            receiverId, 
            chat._id, 
            otherParticipant.fullName || otherParticipant.username,
            otherParticipant.profileImageUrl
          );
        }
      }
    };
  };

  return {
    ...callManager,
    getCallHandlers
  };
};