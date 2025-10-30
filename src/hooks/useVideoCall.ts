import { useState, useEffect, useCallback } from 'react';
import { socketManager } from '@/utils/socket';
import { callAPI } from '@/api/call';
import { streamAPI } from '@/api/stream';
import { Chat } from '@/api/message';
import { pushNotificationManager, CallNotificationData } from '@/utils/pushNotifications';

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
    streamCallType?: 'audio_room' | 'default';
  } | null>(null);
  const [streamToken, setStreamToken] = useState<string | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);

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

  // Handle incoming call from Socket (backup - FCM is primary)
  useEffect(() => {
    const handleIncomingCall = (data: any) => {
      console.log('📞 Incoming call received via Socket:', data);

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

  // Handle incoming call from FCM (primary method)
  useEffect(() => {
    // Handle FCM foreground messages
    const handleFCMCall = (data: CallNotificationData) => {
      console.log('📞 Incoming call received via FCM:', data);

      setIncomingCall({
        callId: data.callId,
        callerId: data.callerId,
        callerName: data.callerName,
        callerImage: data.callerImage,
        chatId: data.chatId,
        callType: data.callType
      });
    };

    // Setup FCM listener
    pushNotificationManager.setupFCMListener(handleFCMCall);

    // Handle service worker messages (from notification actions)
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      const { type, data } = event.data;

      if (type === 'ACCEPT_CALL') {
        console.log('📞 Accept call from notification:', data);
        setIncomingCall({
          callId: data.callId,
          callerId: data.callerId,
          callerName: data.callerName,
          callerImage: data.callerImage,
          chatId: data.chatId,
          callType: data.callType
        });

        // Auto-accept the call
        setTimeout(() => {
          acceptCall();
        }, 100);
      } else if (type === 'DECLINE_CALL') {
        console.log('📞 Decline call from notification:', data);
        if (data.callId) {
          callAPI.declineCall(data.callId).catch(console.error);
        }
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  // Initiate a call
  const initiateCall = useCallback(async (chat: Chat, callType: 'voice' | 'video') => {
    if (!user || chat.chatType !== 'direct') return;

    try {
      // Set initiating state immediately for button feedback
      setIsInitiating(true);

      // Get the other participant
      const otherParticipant = chat.participants.find((p: any) => p._id !== user._id);
      if (!otherParticipant) {
        console.error('No other participant found');
        setIsInitiating(false);
        return;
      }

      // Step 1: Get token immediately (cached if available - instant!)
      const tokenPromise = streamAPI.getStreamToken();

      // Step 2: Start backend call (don't wait)
      const callPromise = callAPI.initiateCall({
        receiverId: otherParticipant._id,
        chatId: chat._id,
        callType
      });

      // Step 3: Wait for both to complete
      const [call, token] = await Promise.all([callPromise, tokenPromise]);

      console.log('📞 Call initiated:', call);

      // Step 4: Create Stream.io call and get streamCallType from backend
      const streamCallData = await streamAPI.createStreamCall({
        callId: call._id,
        callType,
        members: [otherParticipant._id],
        video_enabled: callType === 'video'  // Enable video for video calls
      });

      console.log('📞 Stream.io call created with type:', streamCallData.streamCallType);

      // Step 5: Open modal with correct streamCallType from backend response
      setStreamToken(token);
      setCurrentCall({
        callId: call._id,
        chatId: chat._id,
        callType,
        isInitiator: true,
        streamCallType: streamCallData.streamCallType  // ✅ Use backend's streamCallType, not hardcoded
      });
      setIsVideoCallOpen(true);

    } catch (error: any) {
      console.error('Failed to initiate call:', error);
      // Close modal on error
      setIsVideoCallOpen(false);
      setCurrentCall(null);
      setStreamToken(null); 
      setIsInitiating(false);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to initiate call';
      alert(errorMessage);
    }
  }, [user]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      // Step 1: Get token immediately (cached if available - instant!)
      const tokenPromise = streamAPI.getStreamToken();

      // Step 2: Start backend call (don't wait)
      const acceptPromise = callAPI.acceptCall(incomingCall.callId);

      // Step 3: Wait for both to complete
      const [, token] = await Promise.all([acceptPromise, tokenPromise]);

      console.log('📞 Call accepted:', incomingCall.callId);

      // Step 4: Create Stream.io call and get streamCallType from backend
      const streamCallData = await streamAPI.createStreamCall({
        callId: incomingCall.callId,
        callType: incomingCall.callType,
        members: [incomingCall.callerId],
        video_enabled: incomingCall.callType === 'video'  // Enable video for video calls
      });

      console.log('📞 Stream.io call created with type:', streamCallData.streamCallType);

      // Step 5: Open modal with correct streamCallType from backend response
      setStreamToken(token);
      setCurrentCall({
        callId: incomingCall.callId,
        chatId: incomingCall.chatId,
        callType: incomingCall.callType,
        isInitiator: false,
        streamCallType: streamCallData.streamCallType  // ✅ Use backend's streamCallType, not hardcoded
      });
      setIncomingCall(null);
      setIsVideoCallOpen(true);

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
    isInitiating,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    setIsVideoCallOpen
  };
};
