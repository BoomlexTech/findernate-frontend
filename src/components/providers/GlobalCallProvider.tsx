'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { webRTCManager, CallConfig, CallStats } from '@/utils/webrtc';
import { callAPI, Call } from '@/api/call';
import { socketManager } from '@/utils/socket';
import { useUserStore } from '@/store/useUserStore';
import { IncomingCallModal } from '@/components/call/IncomingCallModal';

export interface CallState {
  call: Call | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isInCall: boolean;
  isInitiator: boolean;
  connectionState: RTCPeerConnectionState | null;
  callStats: CallStats | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  error: string | null;
}

export interface IncomingCall {
  callId: string;
  chatId: string;
  callType: 'voice' | 'video';
  caller: {
    _id: string;
    username: string;
    fullName: string;
    profileImageUrl?: string;
  };
  timestamp: Date;
}

interface GlobalCallContextType {
  // State
  callState: CallState;
  incomingCall: IncomingCall | null;
  isLoading: boolean;
  
  // Actions
  initiateCall: (receiverId: string, chatId: string, callType: 'voice' | 'video') => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  endCall: (endReason?: string) => Promise<void>;
  toggleAudio: () => void;
  toggleVideo: () => void;
  
  // Helpers
  getConnectionQuality: () => 'excellent' | 'good' | 'poor' | 'failed' | null;
  
  // Direct access to streams
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

const GlobalCallContext = createContext<GlobalCallContextType | null>(null);

export const useGlobalCall = () => {
  const context = useContext(GlobalCallContext);
  if (!context) {
    throw new Error('useGlobalCall must be used within a GlobalCallProvider');
  }
  return context;
};

export const GlobalCallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useUserStore((state) => state.user);
  
  const [callState, setCallState] = useState<CallState>({
    call: null,
    localStream: null,
    remoteStream: null,
    isInCall: false,
    isInitiator: false,
    connectionState: null,
    callStats: null,
    isAudioEnabled: true,
    isVideoEnabled: true,
    error: null,
  });

  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs to avoid stale closures
  const callStateRef = useRef(callState);
  callStateRef.current = callState;

  // Update call state helper
  const updateCallState = useCallback((updates: Partial<CallState>) => {
    setCallState(prev => ({ ...prev, ...updates }));
  }, []);

  // Error handler
  const handleError = useCallback((error: Error) => {
    console.error('Global WebRTC Error:', error);
    updateCallState({ error: error.message });
  }, [updateCallState]);

  // End call locally (cleanup without emitting to others)
  const endCallLocally = useCallback(async (endReason: string = 'normal') => {
    if (!callStateRef.current.call) {
      console.log('No active call to end locally');
      return;
    }

    try {
      console.log('Ending call locally:', callStateRef.current.call._id, 'with reason:', endReason);
      
      // End WebRTC call
      webRTCManager.endCall();
      console.log('WebRTC call ended locally');

      // Reset call state
      updateCallState({
        call: null,
        localStream: null,
        remoteStream: null,
        isInCall: false,
        isInitiator: false,
        connectionState: null,
        callStats: null,
        error: null
      });
      console.log('Call state reset locally');

    } catch (error) {
      console.error('Error ending call locally:', error);
      handleError(error as Error);
    }
  }, [updateCallState, handleError]);

  // Setup WebRTC event handlers
  useEffect(() => {
    if (!user) {
      console.log('🌍 Global Call Provider: No user logged in, skipping WebRTC setup');
      return;
    }
    
    console.log('🌍 Global Call Provider: Setting up WebRTC event handlers');
    
    webRTCManager.onRemoteStream((stream) => {
      console.log('🌍 Global: Remote stream received');
      updateCallState({ remoteStream: stream });
    });

    webRTCManager.onConnectionStateChange((state) => {
      console.log('🌍 Global: Connection state changed:', state);
      updateCallState({ connectionState: state });
      
      // Update call status on backend and local state
      if (callStateRef.current.call) {
        if (state === 'connected') {
          console.log('🔥 Global: WebRTC connected, updating call status to active for call:', callStateRef.current.call._id);
          
          // Update local state immediately for responsiveness
          updateCallState({ 
            call: { ...callStateRef.current.call!, status: 'active' }
          });
          
          // Update backend
          callAPI.updateCallStatus(callStateRef.current.call._id, { 
            status: 'active' 
          }).then(() => {
            console.log('✅ Global: Call status updated to active successfully');
          }).catch((error) => {
            console.error('❌ Global: Failed to update call status to active:', error);
          });
        } else if (state === 'failed') {
          updateCallState({ 
            call: { ...callStateRef.current.call!, status: 'failed' }
          });
          callAPI.updateCallStatus(callStateRef.current.call._id, { 
            status: 'failed' 
          }).catch(console.error);
        }
      }
    });

    webRTCManager.onCallStats((stats) => {
      updateCallState({ callStats: stats });
    });

    webRTCManager.onError(handleError);

    return () => {
      // Cleanup will be handled by component unmount
    };
  }, [updateCallState, handleError, user]);

  // Setup socket event handlers
  useEffect(() => {
    if (!user) {
      console.log('🌍 Global Call Provider: No user logged in, skipping setup');
      return;
    }
    
    console.log('🌍 Global Call Provider: Setting up socket event handlers');
    console.log('🌍 Socket manager ready:', socketManager ? 'yes' : 'no');
    console.log('🌍 User logged in:', user.username);
    
    // Handle incoming call
    socketManager.on('incoming_call', (data: IncomingCall) => {
      console.log('🌍 Global: Incoming call received:', data);
      
      // If there's already an active call, clean it up first
      if (callStateRef.current.call && callStateRef.current.isInCall) {
        console.log('🧹 Global: Cleaning up existing call for new incoming call');
        endCallLocally('cancelled').then(() => {
          // Set incoming call after cleanup
          setIncomingCall(data);
          updateCallState({
            call: {
              _id: data.callId,
              status: 'ringing',
              callType: data.callType,
              participants: [],
              initiator: data.caller,
              chatId: data.chatId,
              duration: 0,
              initiatedAt: data.timestamp,
              wasAnswered: false,
              isOngoing: true,
              formattedDuration: '0:00'
            } as any,
            isInCall: false
          });
        });
      } else {
        // No existing call, set incoming call directly
        setIncomingCall(data);
        updateCallState({
          call: {
            _id: data.callId,
            status: 'ringing',
            callType: data.callType,
            participants: [],
            initiator: data.caller,
            chatId: data.chatId,
            duration: 0,
            initiatedAt: data.timestamp,
            wasAnswered: false,
            isOngoing: true,
            formattedDuration: '0:00'
          } as any,
          isInCall: false
        });
      }
    });

    // Handle call accepted
    socketManager.on('call_accepted', (data) => {
      console.log('🌍 Global: Call accepted:', data);
      if (callStateRef.current.call && callStateRef.current.call._id === data.callId) {
        updateCallState({
          call: { ...callStateRef.current.call, status: 'connecting' }
        });
      }
    });

    // Handle call declined
    socketManager.on('call_declined', (data) => {
      console.log('🌍 Global: Call declined:', data);
      if (callStateRef.current.call && callStateRef.current.call._id === data.callId) {
        endCallLocally('declined');
      }
    });

    // Handle call ended
    socketManager.on('call_ended', (data) => {
      console.log('🌍 Global: Call ended by remote user:', data);
      if (callStateRef.current.call && callStateRef.current.call._id === data.callId) {
        console.log('🌍 Global: Remote call end received, ending our call locally with reason:', data.endReason);
        endCallLocally(data.endReason || 'normal');
      }
    });

    // Handle call status updates
    socketManager.on('call_status_update', (data) => {
      console.log('🌍 Global: Call status updated via socket:', data);
      if (callStateRef.current.call && callStateRef.current.call._id === data.callId) {
        updateCallState({
          call: { ...callStateRef.current.call, status: data.status }
        });
      }
    });

    return () => {
      console.log('🌍 Global Call Provider: Cleaning up socket event handlers');
      socketManager.off('incoming_call');
      socketManager.off('call_accepted');
      socketManager.off('call_declined');
      socketManager.off('call_ended');
      socketManager.off('call_status_update');
    };
  }, [updateCallState, endCallLocally, user]);

  // Initiate a call
  const initiateCall = useCallback(async (
    receiverId: string,
    chatId: string,
    callType: 'voice' | 'video'
  ) => {
    try {
      setIsLoading(true);
      updateCallState({ error: null });

      console.log('🌍 Global: Initiating call to:', receiverId);

      // Clean up any existing call first
      if (callStateRef.current.call) {
        console.log('🧹 Global: Cleaning up existing call before starting new one');
        await endCallLocally('cancelled');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Create call on backend
      const call = await callAPI.initiateCall({
        receiverId,
        chatId,
        callType
      });

      updateCallState({
        call,
        isInCall: true,
        isInitiator: true,
        isVideoEnabled: callType === 'video'
      });

      // Start WebRTC call
      const config: CallConfig = {
        audio: true,
        video: callType === 'video'
      };

      const localStream = await webRTCManager.initializeLocalStream(config);
      updateCallState({ localStream });

      await webRTCManager.startCall(call._id, receiverId, config);

      // Emit call initiation via socket
      socketManager.initiateCall(receiverId, chatId, callType, call._id);

    } catch (error: any) {
      console.error('🌍 Global: Error initiating call:', error);
      
      // Handle 409 conflict (user already in call) by cleaning up and retrying
      if (error?.response?.status === 409) {
        console.log('🔄 Global: Call conflict detected, cleaning up and retrying...');
        try {
          // Force cleanup any server-side call state
          await callAPI.getActiveCall().then(activeCall => {
            if (activeCall) {
              return callAPI.endCall(activeCall._id, { endReason: 'cancelled' });
            }
          });
          
          // Reset local state
          updateCallState({
            call: null,
            isInCall: false,
            error: null
          });
          
          // Retry after a short delay
          setTimeout(() => {
            initiateCall(receiverId, chatId, callType);
          }, 1000);
          
          return;
        } catch (cleanupError) {
          console.error('🌍 Global: Error during cleanup:', cleanupError);
        }
      }
      
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [updateCallState, handleError, endCallLocally]);

  // Accept an incoming call
  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      setIsLoading(true);
      updateCallState({ error: null });

      console.log('🌍 Global: Accepting call:', incomingCall.callId);

      // Accept call on backend
      const call = await callAPI.acceptCall(incomingCall.callId);

      updateCallState({
        call,
        isInCall: true,
        isInitiator: false,
        isVideoEnabled: incomingCall.callType === 'video'
      });

      // Accept WebRTC call
      const config: CallConfig = {
        audio: true,
        video: incomingCall.callType === 'video'
      };

      const localStream = await webRTCManager.initializeLocalStream(config);
      updateCallState({ localStream });

      await webRTCManager.acceptCall(incomingCall.callId, config);

      // Emit call acceptance via socket
      socketManager.acceptCall(incomingCall.callId, incomingCall.caller._id);

      setIncomingCall(null);

    } catch (error) {
      console.error('🌍 Global: Error accepting call:', error);
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [incomingCall, updateCallState, handleError]);

  // Decline an incoming call
  const declineCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      console.log('🌍 Global: Declining call:', incomingCall.callId);

      // Decline call on backend
      await callAPI.declineCall(incomingCall.callId);

      // Emit call decline via socket
      socketManager.declineCall(incomingCall.callId, incomingCall.caller._id);

      setIncomingCall(null);

    } catch (error) {
      console.error('🌍 Global: Error declining call:', error);
      handleError(error as Error);
    }
  }, [incomingCall, handleError]);

  // End the current call
  const endCall = useCallback(async (endReason: string = 'normal') => {
    if (!callState.call) {
      console.log('🌍 Global: No active call to end');
      return;
    }

    try {
      console.log('🌍 Global: Ending call:', callState.call._id, 'with reason:', endReason);
      
      // End call on backend
      await callAPI.endCall(callState.call._id, { endReason: endReason as any });

      // Emit call end via socket to notify other participants
      const participantIds = callState.call.participants.map(p => p._id);
      socketManager.endCall(
        callState.call._id,
        participantIds,
        endReason
      );

      // End call locally
      await endCallLocally(endReason);

    } catch (error) {
      console.error('🌍 Global: Error ending call:', error);
      handleError(error as Error);
    }
  }, [callState.call, endCallLocally]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    const newState = !callState.isAudioEnabled;
    webRTCManager.toggleAudio(newState);
    updateCallState({ isAudioEnabled: newState });
  }, [callState.isAudioEnabled, updateCallState]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    const newState = !callState.isVideoEnabled;
    webRTCManager.toggleVideo(newState);
    updateCallState({ isVideoEnabled: newState });
  }, [callState.isVideoEnabled, updateCallState]);

  // Get connection quality
  const getConnectionQuality = useCallback(() => {
    if (!callState.callStats) return null;
    return callState.callStats.quality;
  }, [callState.callStats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callState.isInCall) {
        endCallLocally('cancelled');
      }
    };
  }, []); // Only run on unmount

  const contextValue: GlobalCallContextType = {
    // State
    callState,
    incomingCall,
    isLoading,
    
    // Actions
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo,
    
    // Helpers
    getConnectionQuality,
    
    // Direct access to streams
    localStream: callState.localStream,
    remoteStream: callState.remoteStream,
  };
//for deployment
  return (
    <GlobalCallContext.Provider value={contextValue}>
      {children}
      {/* Global incoming call modal */}
      {incomingCall && (
        <IncomingCallModal
          incomingCall={incomingCall}
          onAccept={acceptCall}
          onDecline={declineCall}
        />
      )}
    </GlobalCallContext.Provider>
  );
};