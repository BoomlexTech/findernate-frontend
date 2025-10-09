import { useState, useEffect, useCallback, useRef } from 'react';
  import { callAPI, Call } from '@/api/call';
import { socketManager } from '@/utils/socket';
import { useUserStore } from '@/store/useUserStore';
import { ringtoneManager } from '@/utils/ringtone';

// Dynamic import for Agora SDK to avoid SSR issues
let AgoraRTC: any = null;

// Initialize Agora SDK only on client side
const initializeAgoraSDK = async () => {
  if (typeof window === 'undefined') return false;
  
  if (!AgoraRTC) {
    try {
      const agoraModule = await import('agora-rtc-sdk-ng');
      AgoraRTC = agoraModule.default;
      return true;
    } catch (error) {
      console.error('Failed to load Agora SDK:', error);
      return false;
    }
  }
  return true;
};

// Agora API interfaces
export interface AgoraChannelDetails {
  channelName: string;
  appId: string;
  rtcToken: string;
  rtmToken: string;
  uid: number;
  userRole: 'publisher' | 'subscriber';
}

export interface AgoraTokenResponse {
  rtcToken: string;
  rtmToken: string;
  channelName: string;
  appId: string;
  uid: number;
  userId: string;
}

export interface AgoraCallState {
  call: Call | null;
  localVideoTrack: any | null;
  localAudioTrack: any | null;
  remoteUsers: any[];
  isInCall: boolean;
  isInitiator: boolean;
  connectionState: any | null;
  networkQuality: any | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  error: string | null;
  agoraChannelDetails: AgoraChannelDetails | null;
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

export const useAgora = () => {
  const user = useUserStore((state) => state.user);
  
  const [callState, setCallState] = useState<AgoraCallState>({
    call: null,
    localVideoTrack: null,
    localAudioTrack: null,
    remoteUsers: [],
    isInCall: false,
    isInitiator: false,
    connectionState: null,
    networkQuality: null,
    isAudioEnabled: true,
    isVideoEnabled: true,
    error: null,
    agoraChannelDetails: null,
  });

  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSDKReady, setIsSDKReady] = useState(false);
  
  // Agora client instance
  const agoraClientRef = useRef<any>(null);
  
  // Refs to avoid stale closures and race conditions
  const callStateRef = useRef(callState);
  callStateRef.current = callState;
  const isAcceptingRef = useRef(false);
  const isDecliningRef = useRef(false);
  const tokenExpiryRef = useRef<number>(0);
  const tokenRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Agora SDK on mount
  useEffect(() => {
    const initSDK = async () => {
      const success = await initializeAgoraSDK();
      setIsSDKReady(success);
    };
    
    initSDK();
  }, []);

  // Initialize Agora client
  const initializeAgoraClient = useCallback(() => {
    if (!isSDKReady || !AgoraRTC) {
      throw new Error('Agora SDK is not ready');
    }
    
    if (!agoraClientRef.current) {
      agoraClientRef.current = AgoraRTC.createClient({
        mode: 'rtc',
        codec: 'vp8'
      });

      // Set up event listeners
      agoraClientRef.current.on('user-published', async (user, mediaType) => {
        console.log('🔊 Agora: User published', user.uid, mediaType);
        
        // Subscribe to the remote user
        await agoraClientRef.current?.subscribe(user, mediaType);
        
        // Update remote users state
        setCallState(prev => {
          const existingUserIndex = prev.remoteUsers.findIndex(u => u.uid === user.uid);
          if (existingUserIndex === -1) {
            // New user - add to array
            return { ...prev, remoteUsers: [...prev.remoteUsers, user] };
          } else {
            // Existing user - update their tracks
            const updatedUsers = [...prev.remoteUsers];
            updatedUsers[existingUserIndex] = user;
            return { ...prev, remoteUsers: updatedUsers };
          }
        });
        
        if (mediaType === 'video') {
          console.log('📹 Agora: Remote video track received');
        }
        
        if (mediaType === 'audio') {
          console.log('🔊 Agora: Remote audio track received');
          // Play remote audio
          user.audioTrack?.play();
        }
      });

      agoraClientRef.current.on('user-unpublished', (user, mediaType) => {
        console.log('🔇 Agora: User unpublished', user.uid, mediaType);
        
        // Update remote users state to reflect unpublished tracks
        setCallState(prev => {
          const updatedUsers = prev.remoteUsers.map(u => {
            if (u.uid === user.uid) {
              // User unpublished a track - update their state
              return user;
            }
            return u;
          });
          return { ...prev, remoteUsers: updatedUsers };
        });
      });

      agoraClientRef.current.on('user-left', (user) => {
        console.log('👋 Agora: User left', user.uid);
        setCallState(prev => ({
          ...prev,
          remoteUsers: prev.remoteUsers.filter(u => u.uid !== user.uid)
        }));
      });

      agoraClientRef.current.on('connection-state-change', (curState, revState, reason) => {
        console.log('🔄 Agora: Connection state changed', curState, revState, reason);
        setCallState(prev => ({ ...prev, connectionState: curState }));
        
        // Handle connection state changes
        if (callStateRef.current.call) {
          if (curState === 'CONNECTED') {
            // Call is now active - backend should handle this via accept endpoint
            console.log('✅ Call connected successfully');
          } else if (curState === 'DISCONNECTED' && reason !== 'LEAVE') {
            // Connection failed - end the call properly
            console.log('❌ Call connection failed, ending call');
            callAPI.endCall(callStateRef.current.call._id, { 
              endReason: 'failed' 
            }).catch(console.error);
            // Clean up local tracks immediately
            endCallLocally('failed');
          } else if (curState === 'FAILED') {
            // Connection completely failed
            console.log('❌ Call connection completely failed');
            if (callStateRef.current.call) {
              callAPI.endCall(callStateRef.current.call._id, { 
                endReason: 'network_error' 
              }).catch(console.error);
            }
            // Clean up local tracks immediately
            endCallLocally('network_error');
          }
        }
      });

      agoraClientRef.current.on('network-quality', (stats) => {
        setCallState(prev => ({ ...prev, networkQuality: stats }));
      });
    }
    
    return agoraClientRef.current;
  }, [isSDKReady]);

  // Update call state helper
  const updateCallState = useCallback((updates: Partial<AgoraCallState>) => {
    setCallState(prev => ({ ...prev, ...updates }));
  }, []);

  // Error handler
  const handleError = useCallback((error: Error) => {
    console.error('Agora Error:', error);
    
    // Handle specific Agora errors
    if (error.message.includes('INVALID_TOKEN')) {
      updateCallState({ error: 'Call token expired. Please try again.' });
    } else if (error.message.includes('TOO_MANY_REQUESTS')) {
      updateCallState({ error: 'Too many requests. Please wait a moment.' });
    } else if (error.message.includes('PERMISSION_DENIED')) {
      updateCallState({ error: 'Microphone or camera access denied.' });
    } else if (error.message.includes('NETWORK_ERROR')) {
      updateCallState({ error: 'Network error. Please check your connection.' });
    } else {
      updateCallState({ error: error.message });
    }
    
    // Auto-cleanup on critical errors
    if (error.message.includes('INVALID_TOKEN') || error.message.includes('NETWORK_ERROR')) {
      setTimeout(() => {
        if (callStateRef.current.call) {
          endCallLocally('failed');
        }
      }, 2000);
    }
  }, [updateCallState]);

  // Get Agora channel details from API
  const getAgoraChannelDetails = useCallback(async (callId: string): Promise<AgoraChannelDetails> => {
    try {
      console.log('🔑 Getting Agora channel details for call:', callId);
      const agoraChannelDetails = await callAPI.getAgoraChannelDetails(callId);
      console.log('✅ Agora channel details received:', agoraChannelDetails);
      return agoraChannelDetails;
    } catch (error) {
      console.error('❌ Error getting Agora channel details:', error);
      throw error;
    }
  }, []);

  // Get Agora token from API
  const getAgoraToken = useCallback(async (callId: string): Promise<AgoraTokenResponse> => {
    try {
      console.log('🔑 Getting Agora token for call:', callId);
      const agoraToken = await callAPI.getAgoraToken(callId, 'publisher');
      console.log('✅ Agora token received:', agoraToken);
      
      // Set token expiry time (Agora tokens typically expire after 24 hours)
      // We'll refresh after 23 hours to be safe
      tokenExpiryRef.current = Date.now() + (23 * 60 * 60 * 1000);
      
      return agoraToken;
    } catch (error) {
      console.error('❌ Error getting Agora token:', error);
      throw error;
    }
  }, []);

  // Refresh Agora token
  const refreshAgoraToken = useCallback(async () => {
    if (!callStateRef.current.call || !agoraClientRef.current) {
      console.log('⚠️ Cannot refresh token - no active call or client');
      return;
    }

    try {
      console.log('🔄 Refreshing Agora token for call:', callStateRef.current.call._id);
      const agoraToken = await getAgoraToken(callStateRef.current.call._id);
      
      // Renew the token in the Agora client
      await agoraClientRef.current.renewToken(agoraToken.rtcToken);
      console.log('✅ Agora token refreshed successfully');
      
      // Update expiry time
      tokenExpiryRef.current = Date.now() + (23 * 60 * 60 * 1000);
    } catch (error) {
      console.error('❌ Error refreshing Agora token:', error);
      // If token refresh fails, the call will likely disconnect
      // The connection state handler will handle cleanup
    }
  }, [getAgoraToken]);

  // End call locally (cleanup without emitting to others)
  const endCallLocally = useCallback(async (endReason: string = 'normal') => {
    if (!callStateRef.current.call) {
      console.log('No active call to end locally');
      return;
    }

    try {
      console.log('Ending Agora call locally:', callStateRef.current.call._id, 'with reason:', endReason);
      
      // Stop any playing ringtones
      ringtoneManager.stopRingtone();
      
      // Clear token refresh timer
      if (tokenRefreshTimerRef.current) {
        clearInterval(tokenRefreshTimerRef.current);
        tokenRefreshTimerRef.current = null;
      }
      tokenExpiryRef.current = 0;
      
      // Stop and release local tracks
      if (callStateRef.current.localAudioTrack) {
        callStateRef.current.localAudioTrack.stop();
        callStateRef.current.localAudioTrack.close();
      }
      
      if (callStateRef.current.localVideoTrack) {
        callStateRef.current.localVideoTrack.stop();
        callStateRef.current.localVideoTrack.close();
      }
      
      // Leave the channel
      if (agoraClientRef.current) {
        await agoraClientRef.current.leave();
      }
      
      console.log('Agora call ended locally');

      // Reset call state
      updateCallState({
        call: null,
        localVideoTrack: null,
        localAudioTrack: null,
        remoteUsers: [],
        isInCall: false,
        isInitiator: false,
        connectionState: null,
        networkQuality: null,
        error: null,
        agoraChannelDetails: null,
      });
      console.log('Call state reset locally');

    } catch (error) {
      console.error('Error ending call locally:', error);
      handleError(error as Error);
    }
  }, [updateCallState, handleError]);

  // Setup socket event handlers
  useEffect(() => {
    if (!user) return;

    // Handle incoming call
    socketManager.on('incoming_call', (data: IncomingCall) => {
      console.log('Incoming call received:', data);
      setIncomingCall(data);
      
      // Start incoming call ringtone
      ringtoneManager.startRingtone('incoming');
      
      // Set a preliminary call state
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

    // Handle call accepted
    socketManager.on('call_accepted', (data) => {
      console.log('Call accepted:', data);
      
      // Stop ringtones when call is accepted
      ringtoneManager.stopRingtone();
      
      if (callStateRef.current.call && callStateRef.current.call._id === data.callId) {
        updateCallState({
          call: { ...callStateRef.current.call, status: 'connecting' }
        });
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
      
      if (callStateRef.current.call && callStateRef.current.call._id === data.callId) {
        endCallLocally(data.endReason || 'normal');
      }
    });

    // Handle call status updates
    socketManager.on('call_status_update', (data) => {
      console.log('Call status updated via socket:', data);
      
      // Only update status if we have a matching call and it's not already in the same status
      if (callStateRef.current.call && 
          callStateRef.current.call._id === data.callId &&
          callStateRef.current.call.status !== data.status) {
        
        console.log(`📞 Call status changed from ${callStateRef.current.call.status} to ${data.status}`);
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
  }, [updateCallState, endCallLocally, user]);

  // Initiate a call
  const initiateCall = useCallback(async (
    receiverId: string,
    chatId: string,
    callType: 'voice' | 'video'
  ) => {
    if (!isSDKReady) {
      throw new Error('Agora SDK is not ready yet. Please wait a moment and try again.');
    }

    try {
      setIsLoading(true);
      updateCallState({ error: null });

      // Clean up any existing calls first
      await cleanupExistingCalls();

      // Create call on backend
      console.log('Creating call on backend for receiver:', receiverId);
      const call = await callAPI.initiateCall({
        receiverId,
        chatId,
        callType
      });
      console.log('Call created on backend:', call._id);

      // Get Agora channel details and token
      console.log('🔑 Requesting Agora credentials for call:', call._id);
      const agoraChannelDetails = await getAgoraChannelDetails(call._id);
      const agoraToken = await getAgoraToken(call._id);
      console.log('✅ Agora credentials obtained successfully');
      // Note: Backend provides both rtcToken and rtmToken, but we only use rtcToken since we use Socket.IO for messaging

      updateCallState({
        call,
        isInCall: true,
        isInitiator: true,
        isVideoEnabled: callType === 'video',
        agoraChannelDetails: agoraChannelDetails
      });

      // Initialize Agora client
      const client = initializeAgoraClient();

      // Create local tracks
      let localAudioTrack: any = null;
      let localVideoTrack: any = null;

      if (callType === 'video') {
        localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        localVideoTrack.setEnabled(true);
      }

      localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrack.setEnabled(true);

      updateCallState({
        localAudioTrack,
        localVideoTrack
      });

      // Join the channel using only RTC token (RTM not needed since we use Socket.IO for messaging)
      await client.join(agoraToken.appId, agoraToken.channelName, agoraToken.rtcToken, agoraToken.uid);
      console.log('Joined Agora RTC channel successfully');

      // Publish local tracks
      if (localVideoTrack) {
        await client.publish([localAudioTrack, localVideoTrack]);
      } else {
        await client.publish([localAudioTrack]);
      }
      console.log('Published local tracks');

      // Emit call initiation via socket
      console.log('Emitting call initiation via socket');
      socketManager.initiateCall(receiverId, chatId, callType, call._id);

      // Start outgoing call ringtone
      ringtoneManager.startRingtone('outgoing');

    } catch (error: any) {
      console.error('Error initiating call:', error);
      
      // Handle 409 conflict (user already in call)
      if (error?.response?.status === 409 || error?.status === 409) {
        console.log('🔄 Call conflict detected - user is already in a call');
        
        try {
          // First, try to get and end any active call
          const activeCall = await callAPI.getActiveCall().catch(() => null);
          if (activeCall) {
            console.log('🧹 Found active call, ending it:', activeCall._id);
            await callAPI.endCall(activeCall._id, { endReason: 'cancelled' });
            
            // Wait a moment for cleanup
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Now try to initiate the new call
            console.log('🔄 Retrying call initiation...');
            await initiateCall(receiverId, chatId, callType);
            return;
          } else {
            // No active call found, but still getting 409 - show user-friendly message
            updateCallState({ 
              error: 'Unable to start call. Please wait a moment and try again.' 
            });
          }
        } catch (cleanupError) {
          console.error('❌ Error during cleanup:', cleanupError);
          updateCallState({ 
            error: 'Call conflict detected. Please wait a moment and try again.' 
          });
        }
      } else {
        // Handle other errors
        handleError(error as Error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isSDKReady, updateCallState, handleError, getAgoraChannelDetails, getAgoraToken, initializeAgoraClient]);

  // Accept an incoming call
  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    
    if (!isSDKReady) {
      throw new Error('Agora SDK is not ready yet. Please wait a moment and try again.');
    }
    
    // Prevent multiple acceptance attempts with ref for immediate check
    if (isAcceptingRef.current) {
      console.log('⚠️ Call acceptance already in progress, ignoring duplicate request');
      return;
    }
    isAcceptingRef.current = true;

    // Note: IncomingCall doesn't have status property - validation handled by backend

    // Store the call ID to prevent race conditions
    const callIdToAccept = incomingCall.callId;
    
    try {
      setIsLoading(true);
      updateCallState({ error: null });

      // Stop incoming call ringtone
      ringtoneManager.stopRingtone();

      // Accept call on backend FIRST (this activates the call and allows token generation)
      console.log('🔄 Attempting to accept call:', callIdToAccept);
      const call = await callAPI.acceptCall(callIdToAccept);
      console.log('✅ Call accepted successfully on backend:', call);

      // Check if this is still the call we want to accept (prevent race conditions)
      if (!incomingCall || incomingCall.callId !== callIdToAccept) {
        console.log('⚠️ Call changed during acceptance, aborting');
        return;
      }

      // Now get Agora channel details and token (AFTER accepting call)
      console.log('🔑 Requesting Agora credentials for accepted call:', callIdToAccept);
      const agoraChannelDetails = await getAgoraChannelDetails(callIdToAccept);
      const agoraToken = await getAgoraToken(callIdToAccept);
      console.log('✅ Agora credentials obtained successfully for accepted call');
      // Note: Backend provides both rtcToken and rtmToken, but we only use rtcToken since we use Socket.IO for messaging

      updateCallState({
        call,
        isInCall: true,
        isInitiator: false,
        isVideoEnabled: incomingCall.callType === 'video',
        agoraChannelDetails: agoraChannelDetails
      });

      // Initialize Agora client
      const client = initializeAgoraClient();

      // Create local tracks
      let localAudioTrack: any = null;
      let localVideoTrack: any = null;

      if (incomingCall.callType === 'video') {
        localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        localVideoTrack.setEnabled(true);
      }

      localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrack.setEnabled(true);

      updateCallState({
        localAudioTrack,
        localVideoTrack
      });

      // Join the channel using only RTC token (RTM not needed since we use Socket.IO for messaging)
      await client.join(agoraToken.appId, agoraToken.channelName, agoraToken.rtcToken, agoraToken.uid);
      console.log('Joined Agora RTC channel successfully');

      // Publish local tracks
      if (localVideoTrack) {
        await client.publish([localAudioTrack, localVideoTrack]);
      } else {
        await client.publish([localAudioTrack]);
      }
      console.log('Published local tracks');

      // Emit call acceptance via socket
      console.log('Emitting call acceptance via socket to caller:', incomingCall.caller._id);
      socketManager.acceptCall(incomingCall.callId, incomingCall.caller._id);

      setIncomingCall(null);

    } catch (error: any) {
      console.error('❌ Error accepting call:', error);
      
      if (error?.response?.data?.message === 'Call cannot be accepted in current status') {
        console.error('❌ Call status issue - the call may have expired or been cancelled');
        setIncomingCall(null);
        updateCallState({ error: 'Call is no longer available' });
      } else if (error?.response?.data?.message === 'Call is not active') {
        console.error('❌ Call is not active - token generation failed. This may be due to call timing or backend state.');
        setIncomingCall(null);
        updateCallState({ error: 'Call is no longer available' });
      } else if (error?.response?.status === 400 && error?.response?.data?.message?.includes('not active')) {
        console.error('❌ Call token generation failed - call may have expired or been cancelled');
        setIncomingCall(null);
        updateCallState({ error: 'Call is no longer available' });
      } else {
        handleError(error as Error);
      }
    } finally {
      setIsLoading(false);
      isAcceptingRef.current = false;
    }
  }, [incomingCall, isSDKReady, updateCallState, handleError, getAgoraChannelDetails, getAgoraToken, initializeAgoraClient]);

  // Decline an incoming call
  const declineCall = useCallback(async () => {
    if (!incomingCall) return;

    // Prevent multiple decline attempts with ref for immediate check
    if (isDecliningRef.current) {
      console.log('⚠️ Call operation already in progress, ignoring decline request');
      return;
    }
    isDecliningRef.current = true;

    // Note: IncomingCall doesn't have status property - validation handled by backend

    try {
      setIsLoading(true);
      
      // Stop incoming call ringtone
      ringtoneManager.stopRingtone();

      // Decline call on backend
      console.log('🔄 Declining call:', incomingCall.callId);
      await callAPI.declineCall(incomingCall.callId);
      console.log('✅ Call declined successfully');

      // Emit call decline via socket
      socketManager.declineCall(incomingCall.callId, incomingCall.caller._id);

      setIncomingCall(null);

    } catch (error: any) {
      console.error('Error declining call:', error);
      
      // Handle specific decline errors
      if (error?.response?.data?.message === 'Call cannot be declined in current status') {
        console.log('⚠️ Call cannot be declined - it may already be accepted or ended');
        setIncomingCall(null);
      } else {
        handleError(error as Error);
      }
    } finally {
      setIsLoading(false);
      isDecliningRef.current = false;
    }
  }, [incomingCall, handleError]);

  // End the current call (initiator - notifies others)
  const endCall = useCallback(async (endReason: string = 'normal') => {
    if (!callState.call) {
      console.log('No active call to end');
      return;
    }

    // Check if call is in a valid state for ending
    if (!['active', 'connecting', 'ringing'].includes(callState.call.status)) {
      console.log('⚠️ Call is not in a valid state for ending:', callState.call.status);
      // Still try to end it locally for cleanup
      await endCallLocally(endReason);
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
  }, [callState.call, endCallLocally, handleError]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    const newState = !callState.isAudioEnabled;
    if (callState.localAudioTrack) {
      callState.localAudioTrack.setEnabled(newState);
    }
    updateCallState({ isAudioEnabled: newState });
  }, [callState.isAudioEnabled, callState.localAudioTrack, updateCallState]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    const newState = !callState.isVideoEnabled;
    if (callState.localVideoTrack) {
      callState.localVideoTrack.setEnabled(newState);
    }
    updateCallState({ isVideoEnabled: newState });
  }, [callState.isVideoEnabled, callState.localVideoTrack, updateCallState]);

  // Helper function to cleanup any existing calls
  const cleanupExistingCalls = useCallback(async () => {
    try {
      console.log('🧹 Checking for existing calls...');
      
      // Check for active call on backend
      const activeCall = await callAPI.getActiveCall().catch(() => null);
      if (activeCall) {
        console.log('🧹 Found active call, ending it:', activeCall._id);
        await callAPI.endCall(activeCall._id, { endReason: 'cancelled' });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Clean up local state
      if (callStateRef.current.call || callStateRef.current.isInCall) {
        console.log('🧹 Cleaning up local call state');
        await endCallLocally('cancelled');
      }
      
      console.log('✅ Call cleanup completed');
      return true;
    } catch (error) {
      console.error('❌ Error during call cleanup:', error);
      return false;
    }
  }, [endCallLocally]);

  // Get connection quality
  const getConnectionQuality = useCallback(() => {
    if (!callState.networkQuality) return null;
    
    // Convert Agora network quality to our quality format
    const quality = callState.networkQuality.quality;
    if (quality >= 4) return 'excellent';
    if (quality >= 2) return 'good';
    if (quality >= 1) return 'poor';
    return 'failed';
  }, [callState.networkQuality]);

  // Token refresh timer - check every minute if token needs refresh
  useEffect(() => {
    if (callState.isInCall && tokenExpiryRef.current > 0) {
      // Start timer to check token expiry every minute
      tokenRefreshTimerRef.current = setInterval(() => {
        const timeUntilExpiry = tokenExpiryRef.current - Date.now();
        
        // Refresh token if less than 5 minutes remaining
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          console.log('⏰ Token expiring soon, refreshing...');
          refreshAgoraToken();
        }
      }, 60000); // Check every minute
      
      return () => {
        if (tokenRefreshTimerRef.current) {
          clearInterval(tokenRefreshTimerRef.current);
          tokenRefreshTimerRef.current = null;
        }
      };
    }
  }, [callState.isInCall, refreshAgoraToken]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop any playing ringtones on unmount
      ringtoneManager.stopRingtone();
      
      // Clear token refresh timer
      if (tokenRefreshTimerRef.current) {
        clearInterval(tokenRefreshTimerRef.current);
        tokenRefreshTimerRef.current = null;
      }
      
      if (callStateRef.current.isInCall) {
        endCall('cancelled');
      }
    };
  }, [endCall]); // Empty dependency to only run on mount/unmount

  return {
    // State
    callState,
    incomingCall,
    isLoading,
    isSDKReady,
    
    // Actions
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo,
    
    // Helpers
    getConnectionQuality,
    cleanupExistingCalls,
    
    // Direct access to tracks (for video elements)
    localVideoTrack: callState.localVideoTrack,
    localAudioTrack: callState.localAudioTrack,
    remoteUsers: callState.remoteUsers,
  };
};
