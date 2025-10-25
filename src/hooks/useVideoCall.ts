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

      // Call backend to initiate call
      const call = await callAPI.initiateCall({
        receiverId: otherParticipant._id,
        chatId: chat._id,
        callType
      });

      console.log('📞 Call initiated:', call);

      // Fetch Stream.io token from backend
      const token = await streamAPI.getStreamToken();
      setStreamToken(token);

      setCurrentCall({
        callId: call._id,
        chatId: chat._id,
        callType,
        isInitiator: true
      });

      setIsVideoCallOpen(true);
    } catch (error: any) {
      console.error('Failed to initiate call:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to initiate call';
      alert(errorMessage);
    }
  }, [user]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      // Call backend to accept call
      await callAPI.acceptCall(incomingCall.callId);

      console.log('📞 Call accepted:', incomingCall.callId);

      // Fetch Stream.io token from backend
      const token = await streamAPI.getStreamToken();
      setStreamToken(token);

      setCurrentCall({
        callId: incomingCall.callId,
        chatId: incomingCall.chatId,
        callType: incomingCall.callType,
        isInitiator: false
      });

      setIncomingCall(null);
      setIsVideoCallOpen(true);
    } catch (error: any) {
      console.error('Failed to accept call:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to accept call';
      alert(errorMessage);
      setIncomingCall(null);
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

    try {
      await callAPI.endCall(currentCall.callId, { endReason: 'normal' });
      console.log('📞 Call ended:', currentCall.callId);
      setIsVideoCallOpen(false);
      setCurrentCall(null);
      setStreamToken(null);
    } catch (error) {
      console.error('Failed to end call:', error);
      setIsVideoCallOpen(false);
      setCurrentCall(null);
      setStreamToken(null);
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
