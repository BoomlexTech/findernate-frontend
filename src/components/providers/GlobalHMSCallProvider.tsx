'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { hmsService, getHMSToken } from '@/utils/hms';
import { callAPI, Call } from '@/api/call';
import { socketManager } from '@/utils/socket';
import { useUserStore } from '@/store/useUserStore';
import { IncomingCallModal } from '@/components/call/IncomingCallModal';
import { 
  selectLocalPeer, 
  selectRemotePeers, 
  selectRoomState,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectErrors
} from '@100mslive/hms-video-store';

export interface HMSCallState {
  call: Call | null;
  localPeer: any;
  remotePeers: any[];
  isInCall: boolean;
  isInitiator: boolean;
  hmsRoomState: string;
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
  hmsRoom?: {
    roomId: string;
    roomCode: string;
    authToken: string | null;
  };
}

interface GlobalHMSCallContextType {
  // State
  callState: HMSCallState;
  incomingCall: IncomingCall | null;
  isLoading: boolean;
  
  // Actions
  initiateCall: (receiverId: string, chatId: string, callType: 'voice' | 'video') => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  endCall: (endReason?: string) => Promise<void>;
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  
  // Helpers
  getConnectionQuality: () => 'excellent' | 'good' | 'poor' | 'failed' | null;
}

const GlobalHMSCallContext = createContext<GlobalHMSCallContextType | null>(null);

export const useGlobalHMSCall = () => {
  const context = useContext(GlobalHMSCallContext);
  if (!context) {
    throw new Error('useGlobalHMSCall must be used within a GlobalHMSCallProvider');
  }
  return context;
};

export const GlobalHMSCallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useUserStore((state) => state.user);
  
  const [callState, setCallState] = useState<HMSCallState>({
    call: null,
    localPeer: null,
    remotePeers: [],
    isInCall: false,
    isInitiator: false,
    hmsRoomState: 'Disconnected',
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
  const updateCallState = useCallback((updates: Partial<HMSCallState>) => {
    setCallState(prev => ({ ...prev, ...updates }));
  }, []);

  // Error handler
  const handleError = useCallback((error: Error) => {
    console.error('Global HMS Error:', error);
    updateCallState({ error: error.message });
  }, [updateCallState]);

  // End call locally (cleanup without emitting to others)
  const endCallLocally = useCallback(async (endReason: string = 'normal') => {
    if (!callStateRef.current.call) {
      console.log('No active call to end locally');
      return;
    }

    try {
      console.log('Ending HMS call locally:', callStateRef.current.call._id, 'with reason:', endReason);
      
      // Leave HMS room if connected
      if (hmsService.isJoined()) {
        await hmsService.leaveRoom();
        console.log('HMS room left locally');
      }

      // Reset call state
      updateCallState({
        call: null,
        localPeer: null,
        remotePeers: [],
        isInCall: false,
        isInitiator: false,
        hmsRoomState: 'Disconnected',
        error: null
      });
      console.log('HMS call state reset locally');

    } catch (error) {
      console.error('Error ending HMS call locally:', error);
      handleError(error as Error);
    }
  }, [updateCallState, handleError]);

  // Subscribe to HMS store updates
  useEffect(() => {
    if (!user) {
      console.log('🏠 Global HMS Call Provider: No user logged in, skipping HMS setup');
      return;
    }
    
    console.log('🏠 Global HMS Call Provider: Setting up HMS store subscriptions');
    
    // Subscribe to local peer
    const unsubscribeLocalPeer = hmsService.subscribe(selectLocalPeer, (localPeer: any) => {
      console.log('🏠 Global HMS: Local peer updated:', localPeer?.name);
      updateCallState({ localPeer });
    });

    // Subscribe to remote peers
    const unsubscribeRemotePeers = hmsService.subscribe(selectRemotePeers, (remotePeers: any[]) => {
      console.log('🏠 Global HMS: Remote peers updated:', remotePeers.length);
      updateCallState({ remotePeers });
    });

    // Subscribe to room state
    const unsubscribeRoomState = hmsService.subscribe(selectRoomState, (roomState: string) => {
      console.log('🏠 Global HMS: Room state changed:', roomState);
      updateCallState({ hmsRoomState: roomState });
      
      // Update call status on backend based on HMS room state
      if (callStateRef.current.call) {
        if (roomState === 'Connected') {
          console.log('🔥 Global HMS: HMS connected, updating call status to active for call:', callStateRef.current.call._id);
          
          // Update local state immediately for responsiveness
          updateCallState({ 
            call: { ...callStateRef.current.call!, status: 'active' }
          });
          
          // Update backend
          callAPI.updateCallStatus(callStateRef.current.call._id, { 
            status: 'active' 
          }).then(() => {
            console.log('✅ Global HMS: Call status updated to active successfully');
          }).catch((error) => {
            console.error('❌ Global HMS: Failed to update call status to active:', error);
          });
        } else if (roomState === 'Failed') {
          updateCallState({ 
            call: { ...callStateRef.current.call!, status: 'failed' }
          });
          callAPI.updateCallStatus(callStateRef.current.call._id, { 
            status: 'failed' 
          }).catch(console.error);
        }
      }
    });

    // Subscribe to local audio state
    const unsubscribeLocalAudio = hmsService.subscribe(selectIsLocalAudioEnabled, (isAudioEnabled: boolean) => {
      updateCallState({ isAudioEnabled });
    });

    // Subscribe to local video state
    const unsubscribeLocalVideo = hmsService.subscribe(selectIsLocalVideoEnabled, (isVideoEnabled: boolean) => {
      updateCallState({ isVideoEnabled });
    });

    // Subscribe to HMS errors
    const unsubscribeErrors = hmsService.subscribe(selectErrors, (errors: any[]) => {
      if (errors && errors.length > 0) {
        const latestError = errors[errors.length - 1];
        console.error('❌ Global HMS Error:', latestError);
        handleError(new Error(latestError.message || 'Unknown HMS error'));
      }
    });

    return () => {
      console.log('🧹 Global HMS Call Provider: Cleaning up HMS subscriptions');
      unsubscribeLocalPeer();
      unsubscribeRemotePeers();
      unsubscribeRoomState();
      unsubscribeLocalAudio();
      unsubscribeLocalVideo();
      unsubscribeErrors();
    };
  }, [updateCallState, handleError, user]);

  // Setup socket event handlers
  useEffect(() => {
    if (!user) {
      console.log('🏠 Global HMS Call Provider: No user logged in, skipping setup');
      return;
    }
    
    console.log('🏠 Global HMS Call Provider: Setting up socket event handlers');
    console.log('🏠 Socket manager ready:', socketManager ? 'yes' : 'no');
    console.log('🏠 User logged in:', user.username);
    
    // Handle incoming call
    socketManager.on('incoming_call', (data: IncomingCall) => {
      console.log('🏠 Global HMS: Incoming call received:', data);
      
      // If there's already an active call, clean it up first
      if (callStateRef.current.call && callStateRef.current.isInCall) {
        console.log('🧹 Global HMS: Cleaning up existing call for new incoming call');
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
      console.log('🏠 Global HMS: Call accepted:', data);
      if (callStateRef.current.call && callStateRef.current.call._id === data.callId) {
        updateCallState({
          call: { ...callStateRef.current.call, status: 'connecting' }
        });
      }
    });

    // Handle call declined
    socketManager.on('call_declined', (data) => {
      console.log('🏠 Global HMS: Call declined:', data);
      if (callStateRef.current.call && callStateRef.current.call._id === data.callId) {
        endCallLocally('declined');
      }
    });

    // Handle call ended
    socketManager.on('call_ended', (data) => {
      console.log('🏠 Global HMS: Call ended by remote user:', data);
      if (callStateRef.current.call && callStateRef.current.call._id === data.callId) {
        console.log('🏠 Global HMS: Remote call end received, ending our call locally with reason:', data.endReason);
        endCallLocally(data.endReason || 'normal');
      }
    });

    // Handle call status updates
    socketManager.on('call_status_update', (data) => {
      console.log('🏠 Global HMS: Call status updated via socket:', data);
      if (callStateRef.current.call && callStateRef.current.call._id === data.callId) {
        updateCallState({
          call: { ...callStateRef.current.call, status: data.status }
        });
      }
    });

    return () => {
      console.log('🏠 Global HMS Call Provider: Cleaning up socket event handlers');
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

      console.log('🏠 Global HMS: Initiating call to:', receiverId);

      // Clean up any existing call first
      if (callStateRef.current.call) {
        console.log('🧹 Global HMS: Cleaning up existing call before starting new one');
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

      // Get HMS token and join room
      console.log('🔑 Fetching HMS token for call:', call._id);
      const tokenData = await getHMSToken(call._id, 'host');
      console.log('✅ Received HMS token data:', {
        hasAuthToken: !!tokenData.authToken,
        roomId: tokenData.roomId,
        roomCode: tokenData.roomCode,
        role: tokenData.role,
        tokenLength: tokenData.authToken?.length
      });
      
      await hmsService.joinRoom(call._id, {
        userName: user?.fullName || user?.username || 'Host',
        authToken: tokenData.authToken
      }, {
        audio: true,
        video: callType === 'video'
      });

      // Emit call initiation via socket
      socketManager.initiateCall(receiverId, chatId, callType, call._id);

    } catch (error: any) {
      console.error('🏠 Global HMS: Error initiating call:', error);
      
      // Handle 409 conflict (user already in call) by cleaning up and retrying
      if (error?.response?.status === 409) {
        console.log('🔄 Global HMS: Call conflict detected, cleaning up and retrying...');
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
          console.error('🏠 Global HMS: Error during cleanup:', cleanupError);
        }
      }
      
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [updateCallState, handleError, endCallLocally, user]);

  // Accept an incoming call
  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      setIsLoading(true);
      updateCallState({ error: null });

      console.log('🏠 Global HMS: Accepting call:', incomingCall.callId);

      // Accept call on backend
      const call = await callAPI.acceptCall(incomingCall.callId);

      updateCallState({
        call,
        isInCall: true,
        isInitiator: false,
        isVideoEnabled: incomingCall.callType === 'video'
      });

      // Get HMS token and join room
      console.log('🔑 Fetching HMS token for incoming call:', incomingCall.callId);
      const tokenData = await getHMSToken(incomingCall.callId, 'guest');
      console.log('✅ Received HMS token data for guest:', {
        hasAuthToken: !!tokenData.authToken,
        roomId: tokenData.roomId,
        roomCode: tokenData.roomCode,
        role: tokenData.role,
        tokenLength: tokenData.authToken?.length
      });
      
      await hmsService.joinRoom(incomingCall.callId, {
        userName: user?.fullName || user?.username || 'Guest',
        authToken: tokenData.authToken
      }, {
        audio: true,
        video: incomingCall.callType === 'video'
      });

      // Emit call acceptance via socket
      socketManager.acceptCall(incomingCall.callId, incomingCall.caller._id);

      setIncomingCall(null);

    } catch (error) {
      console.error('🏠 Global HMS: Error accepting call:', error);
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [incomingCall, updateCallState, handleError, user]);

  // Decline an incoming call
  const declineCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      console.log('🏠 Global HMS: Declining call:', incomingCall.callId);

      // Decline call on backend
      await callAPI.declineCall(incomingCall.callId);

      // Emit call decline via socket
      socketManager.declineCall(incomingCall.callId, incomingCall.caller._id);

      setIncomingCall(null);

    } catch (error) {
      console.error('🏠 Global HMS: Error declining call:', error);
      handleError(error as Error);
    }
  }, [incomingCall, handleError]);

  // End the current call
  const endCall = useCallback(async (endReason: string = 'normal') => {
    if (!callState.call) {
      console.log('🏠 Global HMS: No active call to end');
      return;
    }

    try {
      console.log('🏠 Global HMS: Ending call:', callState.call._id, 'with reason:', endReason);
      
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
      console.error('🏠 Global HMS: Error ending call:', error);
      handleError(error as Error);
    }
  }, [callState.call, endCallLocally]);

  // Toggle audio
  const toggleAudio = useCallback(async () => {
    try {
      const newState = !callState.isAudioEnabled;
      await hmsService.toggleAudio(newState);
      updateCallState({ isAudioEnabled: newState });
    } catch (error) {
      console.error('🏠 Global HMS: Error toggling audio:', error);
      handleError(error as Error);
    }
  }, [callState.isAudioEnabled, updateCallState, handleError]);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    try {
      const newState = !callState.isVideoEnabled;
      await hmsService.toggleVideo(newState);
      updateCallState({ isVideoEnabled: newState });
    } catch (error) {
      console.error('🏠 Global HMS: Error toggling video:', error);
      handleError(error as Error);
    }
  }, [callState.isVideoEnabled, updateCallState, handleError]);

  // Get connection quality
  const getConnectionQuality = useCallback(() => {
    // HMS doesn't provide direct quality stats like WebRTC
    // We can infer from room state
    switch (callState.hmsRoomState) {
      case 'Connected':
        return 'good' as const;
      case 'Failed':
        return 'failed' as const;
      case 'Connecting':
        return 'poor' as const;
      default:
        return null;
    }
  }, [callState.hmsRoomState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callState.isInCall) {
        endCallLocally('cancelled');
      }
    };
  }, []); // Only run on unmount

  const contextValue: GlobalHMSCallContextType = {
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
  };

  return (
    <GlobalHMSCallContext.Provider value={contextValue}>
      {children}
      {/* Global incoming call modal */}
      {incomingCall && (
        <IncomingCallModal
          incomingCall={incomingCall}
          onAccept={acceptCall}
          onDecline={declineCall}
        />
      )}
    </GlobalHMSCallContext.Provider>
  );
};