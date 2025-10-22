'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { callAPI } from '@/api/call';
import { useZegoCall, ZegoCallConfig } from '@/hooks/useZegoCall';
import { useSocket } from '@/hooks/useSocket';
import { IncomingCallModal } from '@/components/call/IncomingCallModal';
import type { IncomingCall } from '@/components/call/IncomingCallModal';
import { toast } from 'react-toastify';

interface ZegoCallContextValue {
  initiateCall: (receiverId: string, chatId: string, callType: 'voice' | 'video') => Promise<void>;
  acceptIncomingCall: () => Promise<void>;
  declineIncomingCall: () => Promise<void>;
  endCurrentCall: () => Promise<void>;
  isInCall: boolean;
  isConnecting: boolean;
  currentCallId: string | null;
  incomingCall: IncomingCall | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoEnabled: boolean;
  toggleMute: () => void;
  toggleVideo: () => void;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
  callDuration: number;
  currentCallType: 'voice' | 'video' | null;
}

const ZegoCallContext = createContext<ZegoCallContextValue | undefined>(undefined);

export const useZegoGlobalCall = () => {
  const context = useContext(ZegoCallContext);
  if (!context) {
    throw new Error('useZegoGlobalCall must be used within ZegoCallProvider');
  }
  return context;
};

interface ZegoCallProviderProps {
  children: React.ReactNode;
}

export const ZegoCallProvider: React.FC<ZegoCallProviderProps> = ({ children }) => {
  const user = useUserStore((state) => state.user);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [currentCallType, setCurrentCallType] = useState<'voice' | 'video' | null>(null);
  const [isAcceptingCall, setIsAcceptingCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callStartTimeRef = useRef<number | null>(null);

  const {
    isInCall,
    isConnecting,
    isMuted,
    isVideoEnabled,
    localStream,
    remoteStream,
    connectionQuality,
    error,
    joinCall,
    leaveCall,
    toggleMute,
    toggleVideo,
    refreshToken
  } = useZegoCall();

  // Start call duration timer
  const startCallTimer = useCallback(() => {
    callStartTimeRef.current = Date.now();
    callTimerRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        const duration = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        setCallDuration(duration);
      }
    }, 1000);
  }, []);

  // Stop call duration timer
  const stopCallTimer = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    callStartTimeRef.current = null;
    setCallDuration(0);
  }, []);

  // Handle ZegoCloud errors
  useEffect(() => {
    if (error) {
      console.error('ZegoCloud error:', error);
      toast.error(error);
    }
  }, [error]);

  // Initiate a call
  const initiateCall = useCallback(async (receiverId: string, chatId: string, callType: 'voice' | 'video') => {
    try {
      if (!user) {
        toast.error('You must be logged in to make calls');
        return;
      }

      console.log('📞 Initiating call...', { receiverId, chatId, callType });

      // Call backend to initiate
      const callData = await callAPI.initiateCall({ receiverId, chatId, callType });
      console.log('✅ Call initiated:', callData);

      setCurrentCallId(callData._id);
      setCurrentCallType(callType);

      // Get ZegoCloud token
      const { zegoRoom, zegoToken } = await callAPI.getZegoToken(callData._id, 'publisher');

      console.log('🎫 Got ZegoCloud token, joining room...');

      // Join ZegoCloud room
      const config: ZegoCallConfig = {
        appId: zegoRoom.appId,
        server: zegoRoom.server || 'wss://webliveroom-api.zegocloud.com/ws',
        roomId: zegoRoom.roomId,
        token: zegoToken,
        userId: user._id,
        userName: user.fullName,
        callType
      };

      await joinCall(config);
      startCallTimer();
      toast.success(`${callType === 'video' ? 'Video' : 'Voice'} call started`);

    } catch (error: any) {
      console.error('❌ Failed to initiate call:', error);
      toast.error(error.response?.data?.message || 'Failed to start call');
      setCurrentCallId(null);
      setCurrentCallType(null);
    }
  }, [user, joinCall, startCallTimer]);

  // Accept incoming call
  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCall || !user) return;

    try {
      setIsAcceptingCall(true);
      console.log('📞 Accepting incoming call:', incomingCall.callId);

      // Accept call on backend
      const callData = await callAPI.acceptCall(incomingCall.callId);
      console.log('✅ Call accepted:', callData);

      setCurrentCallId(callData._id);
      setCurrentCallType(incomingCall.callType);

      // Get ZegoCloud token
      const { zegoRoom, zegoToken } = await callAPI.getZegoToken(callData._id, 'publisher');

      console.log('🎫 Got ZegoCloud token, joining room...');

      // Join ZegoCloud room
      const config: ZegoCallConfig = {
        appId: zegoRoom.appId,
        server: zegoRoom.server || 'wss://webliveroom-api.zegocloud.com/ws',
        roomId: zegoRoom.roomId,
        token: zegoToken,
        userId: user._id,
        userName: user.fullName,
        callType: incomingCall.callType
      };

      await joinCall(config);
      startCallTimer();
      setIncomingCall(null);
      toast.success('Call connected');

    } catch (error: any) {
      console.error('❌ Failed to accept call:', error);
      toast.error(error.response?.data?.message || 'Failed to accept call');
      setIncomingCall(null);
    } finally {
      setIsAcceptingCall(false);
    }
  }, [incomingCall, user, joinCall, startCallTimer]);

  // Decline incoming call
  const declineIncomingCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      console.log('❌ Declining incoming call:', incomingCall.callId);
      await callAPI.declineCall(incomingCall.callId);
      setIncomingCall(null);
      toast.info('Call declined');
    } catch (error: any) {
      console.error('❌ Failed to decline call:', error);
      toast.error('Failed to decline call');
      setIncomingCall(null);
    }
  }, [incomingCall]);

  // End current call
  const endCurrentCall = useCallback(async () => {
    try {
      console.log('📞 Ending current call...');

      // Leave ZegoCloud room first
      await leaveCall();
      stopCallTimer();

      // Update backend if we have a call ID
      if (currentCallId) {
        await callAPI.endCall(currentCallId, { endReason: 'normal' });
      }

      setCurrentCallId(null);
      setCurrentCallType(null);
      toast.info('Call ended');

    } catch (error: any) {
      console.error('❌ Failed to end call:', error);
      // Still clean up local state even if backend fails
      setCurrentCallId(null);
      setCurrentCallType(null);
      stopCallTimer();
    }
  }, [currentCallId, leaveCall, stopCallTimer]);

  // Listen for incoming calls via socket
  useEffect(() => {
    if (!user) return;

    const handleIncomingCall = (data: any) => {
      console.log('📞 Incoming call received:', data);

      // Don't show incoming call if already in a call
      if (isInCall) {
        console.log('⚠️ Already in a call, auto-declining');
        callAPI.declineCall(data.callId).catch(console.error);
        return;
      }

      setIncomingCall({
        callId: data.callId,
        callType: data.callType,
        caller: data.caller,
        timestamp: Date.now()
      });

      // Play incoming call sound
      try {
        const audio = new Audio('/sounds/incoming-call.mp3');
        audio.loop = true;
        audio.play().catch(console.error);

        // Stop sound when call is answered or declined
        const stopSound = () => audio.pause();
        setTimeout(stopSound, 30000); // Stop after 30 seconds
      } catch (err) {
        console.error('Failed to play call sound:', err);
      }
    };

    const handleCallEnded = (data: any) => {
      console.log('📞 Call ended by remote:', data);

      if (data.callId === currentCallId) {
        leaveCall();
        stopCallTimer();
        setCurrentCallId(null);
        setCurrentCallType(null);
        toast.info('Call ended by other participant');
      }
    };

    const handleCallDeclined = (data: any) => {
      console.log('❌ Call declined by remote:', data);

      if (data.callId === currentCallId) {
        leaveCall();
        stopCallTimer();
        setCurrentCallId(null);
        setCurrentCallType(null);
        toast.info('Call was declined');
      }
    };

    // Register socket listeners
    const socket = (window as any).socket;
    if (socket) {
      socket.on('incoming_call', handleIncomingCall);
      socket.on('call_ended', handleCallEnded);
      socket.on('call_declined', handleCallDeclined);
    }

    return () => {
      if (socket) {
        socket.off('incoming_call', handleIncomingCall);
        socket.off('call_ended', handleCallEnded);
        socket.off('call_declined', handleCallDeclined);
      }
    };
  }, [user, isInCall, currentCallId, leaveCall, stopCallTimer]);

  // Token refresh - refresh 5 minutes before expiration
  useEffect(() => {
    if (!currentCallId || !isInCall) return;

    const refreshInterval = setInterval(async () => {
      try {
        console.log('🔄 Refreshing ZegoCloud token...');
        const { zegoToken } = await callAPI.getZegoToken(currentCallId, 'publisher');
        await refreshToken(zegoToken);
        console.log('✅ Token refreshed');
      } catch (error) {
        console.error('❌ Failed to refresh token:', error);
      }
    }, 55 * 60 * 1000); // Refresh every 55 minutes (tokens expire in 60 minutes)

    return () => clearInterval(refreshInterval);
  }, [currentCallId, isInCall, refreshToken]);

  const contextValue: ZegoCallContextValue = {
    initiateCall,
    acceptIncomingCall,
    declineIncomingCall,
    endCurrentCall,
    isInCall,
    isConnecting,
    currentCallId,
    incomingCall,
    localStream,
    remoteStream,
    isMuted,
    isVideoEnabled,
    toggleMute,
    toggleVideo,
    connectionQuality,
    callDuration,
    currentCallType
  };

  return (
    <ZegoCallContext.Provider value={contextValue}>
      {children}

      {/* Incoming Call Modal */}
      {incomingCall && !isInCall && (
        <IncomingCallModal
          incomingCall={incomingCall}
          onAccept={acceptIncomingCall}
          onDecline={declineIncomingCall}
          isLoading={isAcceptingCall}
        />
      )}
    </ZegoCallContext.Provider>
  );
};
