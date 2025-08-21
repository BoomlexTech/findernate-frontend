import { useState, useEffect, useCallback, useRef } from 'react';
import { webRTCManager, CallConfig, CallStats } from '@/utils/webrtc';
import { callAPI, Call } from '@/api/call';
import { socketManager } from '@/utils/socket';
import { useUserStore } from '@/store/useUserStore';
import { ringtoneManager } from '@/utils/ringtone';

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

export const useWebRTC = () => {
  const user = useUserStore((state) => state.user);
  
  // Ensure WebRTC manager is initialized when hook is used
  console.log('🎯 useWebRTC hook initialized, WebRTC manager ready:', !!webRTCManager);
  
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
    console.error('WebRTC Error:', error);
    updateCallState({ error: error.message });
  }, [updateCallState]);

  // Ensure WebRTC manager is initialized immediately 
  useEffect(() => {
    // This forces WebRTC manager singleton to initialize and set up socket listeners
    // as soon as the hook is used, not just when a call starts
    console.log('Initializing WebRTC manager...');
    webRTCManager; // Access singleton to trigger constructor
  }, []);

  // Setup WebRTC event handlers
  useEffect(() => {
    webRTCManager.onRemoteStream((stream) => {
      console.log('Remote stream received');
      updateCallState({ remoteStream: stream });
    });

    webRTCManager.onConnectionStateChange((state) => {
      console.log('Connection state changed:', state);
      console.log('Current call in callStateRef:', callStateRef.current.call?._id);
      updateCallState({ connectionState: state });
      
      // Update call status on backend and local state
      if (callStateRef.current.call) {
        if (state === 'connected') {
          console.log('🔥 WebRTC connected, updating call status to active for call:', callStateRef.current.call._id);
          
          // Update local state immediately for responsiveness
          updateCallState({ 
            call: { ...callStateRef.current.call!, status: 'active' }
          });
          
          // Update backend
          callAPI.updateCallStatus(callStateRef.current.call._id, { 
            status: 'active' 
          }).then(() => {
            console.log('✅ Call status updated to active successfully');
          }).catch((error) => {
            console.error('❌ Failed to update call status to active:', error);
            // Revert local state on error
            updateCallState({ 
              call: { ...callStateRef.current.call!, status: 'connecting' }
            });
          });
        } else if (state === 'failed') {
          updateCallState({ 
            call: { ...callStateRef.current.call!, status: 'failed' }
          });
          callAPI.updateCallStatus(callStateRef.current.call._id, { 
            status: 'failed' 
          }).catch(console.error);
        }
      } else {
        console.log('⚠️ No active call found when WebRTC state changed to:', state);
      }
    });

    webRTCManager.onCallStats((stats) => {
      updateCallState({ callStats: stats });
    });

    webRTCManager.onError(handleError);

    return () => {
      // Cleanup will be handled by the component using this hook
    };
  }, [updateCallState, handleError]);

  // End call locally (cleanup without emitting to others)
  const endCallLocally = useCallback(async (endReason: string = 'normal') => {
    if (!callStateRef.current.call) {
      console.log('No active call to end locally');
      return;
    }

    try {
      console.log('Ending call locally:', callStateRef.current.call._id, 'with reason:', endReason);
      
      // Stop any playing ringtones
      ringtoneManager.stopRingtone();
      
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

  // Setup socket event handlers
  useEffect(() => {
    // Handle incoming call
    socketManager.on('incoming_call', (data: IncomingCall) => {
      console.log('Incoming call received:', data);
      setIncomingCall(data);
      
      // Start incoming call ringtone
      ringtoneManager.startRingtone('incoming');
      
      // Set a preliminary call state so WebRTC events can reference it
      updateCallState({
        call: {
          _id: data.callId,
          status: 'ringing',
          callType: data.callType,
          participants: [], // Will be populated when call is accepted
          initiator: data.caller,
          chatId: data.chatId,
          duration: 0,
          initiatedAt: data.timestamp,
          wasAnswered: false,
          isOngoing: true,
          formattedDuration: '0:00'
        } as any,
        isInCall: false // Not fully in call until accepted
      });
    });

    // Handle call accepted
    socketManager.on('call_accepted', (data) => {
      console.log('Call accepted:', data);
      
      // Stop ringtones when call is accepted
      ringtoneManager.stopRingtone();
      
      if (callStateRef.current.call && callStateRef.current.call._id === data.callId) {
        console.log('Call accepted for our call, updating status to connecting');
        updateCallState({
          call: { ...callStateRef.current.call, status: 'connecting' }
        });
        
        // The WebRTC offer should already have been sent in initiateCall
        // but let's log to make sure
        console.log('WebRTC offer should have been sent during initiateCall');
      }
    });

    // Handle call declined
    socketManager.on('call_declined', (data) => {
      console.log('Call declined:', data);
      
      // Stop ringtones when call is declined
      ringtoneManager.stopRingtone();
      
      if (callStateRef.current.call && callStateRef.current.call._id === data.callId) {
        endCallLocally('declined');
      }
    });

    // Handle call ended
    socketManager.on('call_ended', (data) => {
      console.log('Call ended by remote user:', data);
      
      // Stop ringtones when call is ended
      ringtoneManager.stopRingtone();
      console.log('Current call state:', callStateRef.current.call ? {
        id: callStateRef.current.call._id,
        status: callStateRef.current.call.status,
        isInCall: callStateRef.current.isInCall
      } : 'No active call');
      
      if (callStateRef.current.call && callStateRef.current.call._id === data.callId) {
        console.log('Remote call end received, ending our call locally with reason:', data.endReason);
        endCallLocally(data.endReason || 'normal');
      } else {
        console.log('Call end received but no matching active call');
        console.log('Expected callId:', data.callId);
        console.log('Current callId:', callStateRef.current.call?._id || 'none');
      }
    });

    // Handle call status updates
    socketManager.on('call_status_update', (data) => {
      console.log('Call status updated via socket:', data);
      if (callStateRef.current.call && callStateRef.current.call._id === data.callId) {
        console.log(`Updating call status from ${callStateRef.current.call.status} to ${data.status}`);
        updateCallState({
          call: { ...callStateRef.current.call, status: data.status }
        });
      }
    });

    return () => {
      socketManager.off('incoming_call');
      socketManager.off('call_accepted');
      socketManager.off('call_declined');
      socketManager.off('call_ended');
      socketManager.off('call_status_update');
    };
  }, [updateCallState, endCallLocally]);

  // Initiate a call
  const initiateCall = useCallback(async (
    receiverId: string,
    chatId: string,
    callType: 'voice' | 'video'
  ) => {
    try {
      setIsLoading(true);
      updateCallState({ error: null });

      // Clean up any existing call first
      if (callStateRef.current.call) {
        console.log('🧹 Cleaning up existing call before starting new one');
        await endCall('cancelled');
        // Wait a bit for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Create call on backend
      console.log('Creating call on backend for receiver:', receiverId);
      const call = await callAPI.initiateCall({
        receiverId,
        chatId,
        callType
      });
      console.log('Call created on backend:', call._id);

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

      console.log('Initializing local stream for initiator');
      const localStream = await webRTCManager.initializeLocalStream(config);
      updateCallState({ localStream });

      console.log('About to start WebRTC call with receiver:', receiverId);
      console.log('Call config:', config);
      console.log('Call ID:', call._id);
      try {
        await webRTCManager.startCall(call._id, receiverId, config);
        console.log('WebRTC startCall completed successfully');
      } catch (startCallError) {
        console.error('Error in webRTCManager.startCall:', startCallError);
        throw startCallError;
      }

      // Emit call initiation via socket
      console.log('Emitting call initiation via socket');
      socketManager.initiateCall(receiverId, chatId, callType, call._id);
      console.log('Socket call initiation emitted');

      // Start outgoing call ringtone
      ringtoneManager.startRingtone('outgoing');

    } catch (error: any) {
      console.error('Error initiating call:', error);
      console.error('Error status:', error?.response?.status);
      console.error('Error data:', error?.response?.data);
      
      // Handle 409 conflict (user already in call) by cleaning up and retrying
      if (error?.response?.status === 409 || error?.status === 409) {
        console.log('🔄 Call conflict detected, cleaning up and retrying...');
        try {
          // Force cleanup any server-side call state
          const activeCall = await callAPI.getActiveCall().catch(() => null);
          if (activeCall) {
            console.log('🔄 Found active call to cleanup:', activeCall._id);
            await callAPI.endCall(activeCall._id, { endReason: 'cancelled' });
            console.log('🔄 Active call cleaned up successfully');
          } else {
            console.log('🔄 No active call found on server');
          }
          
          // Reset local state
          updateCallState({
            call: null,
            isInCall: false,
            error: null
          });
          
          console.log('🔄 Retrying call initiation in 1 second...');
          // Retry after a short delay
          setTimeout(() => {
            initiateCall(receiverId, chatId, callType);
          }, 1000);
          
          return;
        } catch (cleanupError) {
          console.error('❌ Error during cleanup:', cleanupError);
        }
      }
      
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [updateCallState, handleError]);

  // Accept an incoming call
  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    
    // Prevent multiple acceptance attempts
    if (isLoading) {
      console.log('⚠️ Call acceptance already in progress, ignoring duplicate request');
      return;
    }

    try {
      setIsLoading(true);
      updateCallState({ error: null });

      // Stop incoming call ringtone
      ringtoneManager.stopRingtone();

      // Accept call on backend
      console.log('🔄 Attempting to accept call:', incomingCall.callId);
      console.log('🔄 Call details:', incomingCall);
      const call = await callAPI.acceptCall(incomingCall.callId);
      console.log('✅ Call accepted successfully on backend:', call);

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

      console.log('About to accept WebRTC call:', incomingCall.callId);
      await webRTCManager.acceptCall(incomingCall.callId, config);

      // Emit call acceptance via socket
      console.log('Emitting call acceptance via socket to caller:', incomingCall.caller._id);
      socketManager.acceptCall(incomingCall.callId, incomingCall.caller._id);

      setIncomingCall(null);

    } catch (error: any) {
      console.error('❌ Error accepting call:', error);
      console.error('❌ Error response:', error?.response?.data);
      console.error('❌ Call ID that failed:', incomingCall.callId);
      console.error('❌ Error status:', error?.response?.status);
      
      if (error?.response?.data?.message === 'Call cannot be accepted in current status') {
        console.error('❌ Call status issue - the call may have expired or been cancelled');
        console.error('❌ This usually happens when:');
        console.error('   1. Call was already declined/ended by caller');
        console.error('   2. Call timed out on backend');
        console.error('   3. Network delay caused status race condition');
        
        // Clear the incoming call since it's no longer valid
        setIncomingCall(null);
        updateCallState({ error: 'Call is no longer available' });
      } else {
        handleError(error as Error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [incomingCall, updateCallState, handleError]);

  // Decline an incoming call
  const declineCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      // Stop incoming call ringtone
      ringtoneManager.stopRingtone();

      // Decline call on backend
      await callAPI.declineCall(incomingCall.callId);

      // Emit call decline via socket
      socketManager.declineCall(incomingCall.callId, incomingCall.caller._id);

      setIncomingCall(null);

    } catch (error) {
      console.error('Error declining call:', error);
      handleError(error as Error);
    }
  }, [incomingCall, handleError]);

  // End the current call (initiator - notifies others)
  const endCall = useCallback(async (endReason: string = 'normal') => {
    if (!callState.call) {
      console.log('No active call to end');
      return;
    }

    try {
      console.log('Ending call:', callState.call._id, 'with reason:', endReason);
      
      // Stop any playing ringtones
      ringtoneManager.stopRingtone();
      
      // End call on backend
      await callAPI.endCall(callState.call._id, { endReason: endReason as any });
      console.log('Call ended on backend');

      // Emit call end via socket to notify other participants
      const participantIds = callState.call.participants.map(p => p._id);
      console.log('Emitting call end to participants:', participantIds);
      socketManager.endCall(
        callState.call._id,
        participantIds,
        endReason
      );

      // End call locally
      await endCallLocally(endReason);

    } catch (error) {
      console.error('Error ending call:', error);
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
      // Stop any playing ringtones on unmount
      ringtoneManager.stopRingtone();
      
      if (callState.isInCall) {
        endCall('cancelled');
      }
    };
  }, []); // Only run on unmount

  return {
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
    
    // Direct access to streams (for video elements)
    localStream: callState.localStream,
    remoteStream: callState.remoteStream,
  };
};