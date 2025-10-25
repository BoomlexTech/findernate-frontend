import { useState, useEffect, useCallback } from 'react';
import { socketManager } from '@/utils/socket';
import { callAPI } from '@/api/call';
import { streamAPI } from '@/api/stream';
import { Chat } from '@/api/message';

interface UseVideoCallProps {
  user: any;
}

interface IncomingCall {
  callId: string;
  callerId: string;
  callerName: string;
  callerImage?: string;
  chatId: string;
  callType: 'voice' | 'video';
}

export const useVideoCall = ({ user }: UseVideoCallProps) => {
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [currentCall, setCurrentCall] = useState<{
    callId: string;
    chatId: string;
    callType: 'voice' | 'video';
    isInitiator: boolean;
  } | null>(null);
  const [streamToken, setStreamToken] = useState<string | null>(null);

  // Clean up any stuck active calls on mount
  useEffect(() => {
    const cleanupActiveCall = async () => {
      try {
        const activeCall = await callAPI.getActiveCall();
        if (activeCall) {
          console.log('🧹 Found stuck active call, cleaning up:', activeCall._id);
          await callAPI.endCall(activeCall._id, { endReason: 'cancelled' });
        }
      } catch (error) {
        console.error('Failed to cleanup active call:', error);
      }
    };

    cleanupActiveCall();
  }, []);

  // Handle incoming call
  useEffect(() => {
    const handleIncomingCall = (data: any) => {
      console.log('📞 Incoming call received:', data);

      setIncomingCall({
        callId: data.callId,
        callerId: data.caller._id,
        callerName: data.caller.fullName || data.caller.username,
        callerImage: data.caller.profileImageUrl,
        chatId: data.chatId,
        callType: data.callType
      });
    };

    const handleCallDeclined = (data: any) => {
      console.log('📞 Call declined:', data);
      if (currentCall?.callId === data.callId) {
        setIsVideoCallOpen(false);
        setCurrentCall(null);
        alert('Call was declined');
      }
    };

    const handleCallEnded = (data: any) => {
      console.log('📞 Call ended:', data);
      if (currentCall?.callId === data.callId) {
        setIsVideoCallOpen(false);
        setCurrentCall(null);
      }
    };

    socketManager.on('incoming_call', handleIncomingCall);
    socketManager.on('call_declined', handleCallDeclined);
    socketManager.on('call_ended', handleCallEnded);

    return () => {
      socketManager.off('incoming_call', handleIncomingCall);
      socketManager.off('call_declined', handleCallDeclined);
      socketManager.off('call_ended', handleCallEnded);
    };
  }, [currentCall]);

  // Initiate a call
  const initiateCall = useCallback(async (chat: Chat, callType: 'voice' | 'video') => {
    if (!user || chat.chatType !== 'direct') return;

    try {
      // Get the other participant
      const otherParticipant = chat.participants.find((p: any) => p._id !== user._id);
      if (!otherParticipant) {
        console.error('No other participant found');
        return;
      }

      // Optimistic update: Open modal immediately with placeholder
      setCurrentCall({
        callId: 'connecting', // Temporary ID
        chatId: chat._id,
        callType,
        isInitiator: true
      });
      setIsVideoCallOpen(true);

      // Parallelize API calls for faster connection
      const [call, token] = await Promise.all([
        callAPI.initiateCall({
          receiverId: otherParticipant._id,
          chatId: chat._id,
          callType
        }),
        streamAPI.getStreamToken()
      ]);

      console.log('📞 Call initiated:', call);

      // Update with real call ID and token
      setStreamToken(token);
      setCurrentCall({
        callId: call._id,
        chatId: chat._id,
        callType,
        isInitiator: true
      });
    } catch (error: any) {
      console.error('Failed to initiate call:', error);
      // Close modal on error
      setIsVideoCallOpen(false);
      setCurrentCall(null);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to initiate call';
      alert(errorMessage);
    }
  }, [user]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      // Optimistic update: Open modal immediately
      setCurrentCall({
        callId: 'connecting',
        chatId: incomingCall.chatId,
        callType: incomingCall.callType,
        isInitiator: false
      });
      setIncomingCall(null);
      setIsVideoCallOpen(true);

      // Parallelize API calls for faster connection
      const [, token] = await Promise.all([
        callAPI.acceptCall(incomingCall.callId),
        streamAPI.getStreamToken()
      ]);

      console.log('📞 Call accepted:', incomingCall.callId);

      // Update with real call ID and token
      setStreamToken(token);
      setCurrentCall({
        callId: incomingCall.callId,
        chatId: incomingCall.chatId,
        callType: incomingCall.callType,
        isInitiator: false
      });
    } catch (error: any) {
      console.error('Failed to accept call:', error);
      // Close modal on error
      setIsVideoCallOpen(false);
      setCurrentCall(null);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to accept call';
      alert(errorMessage);
    }
  }, [incomingCall]);

  // Decline incoming call
  const declineCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      await callAPI.declineCall(incomingCall.callId);
      console.log('📞 Call declined:', incomingCall.callId);
      setIncomingCall(null);
    } catch (error) {
      console.error('Failed to decline call:', error);
      setIncomingCall(null);
    }
  }, [incomingCall]);

  // End current call
  const endCall = useCallback(async () => {
    if (!currentCall) return;

    const callId = currentCall.callId;

    // Optimistic update - clear state immediately for better UX
    setIsVideoCallOpen(false);
    setCurrentCall(null);
    setStreamToken(null);

    try {
      // Make API call in background (with timeout protection)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('End call API timeout')), 10000)
      );

      await Promise.race([
        callAPI.endCall(callId, { endReason: 'normal' }),
        timeoutPromise
      ]);

      console.log('📞 Call ended successfully:', callId);
    } catch (error) {
      console.error('Failed to end call (state already cleared):', error);
      // State already cleared, so user experience is not affected
    }
  }, [currentCall]);

  return {
    isVideoCallOpen,
    incomingCall,
    currentCall,
    streamToken,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    setIsVideoCallOpen
  };
};
