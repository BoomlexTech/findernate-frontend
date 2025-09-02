'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { selectLocalPeer, selectPeers, selectRoomState, selectIsConnectedToRoom, selectErrors } from '@100mslive/hms-video-store';
import { hmsService, getHMSToken, HMSMediaSettings } from '@/utils/hms';
import { callAPI, Call } from '@/api/call';
import { socketManager } from '@/utils/socket';
import { ringtoneManager } from '@/utils/ringtone';

// Call state enum matching Flutter implementation
export enum CallState {
  IDLE = 'idle',
  CALLING = 'calling',
  RINGING = 'ringing',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  INCOMING = 'incoming',
  ENDED = 'ended',
  FAILED = 'failed'
}

// HMS Call provider state
interface HMSCallProviderState {
  currentState: CallState;
  currentCall: Call | null;
  incomingCall: any | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  callDuration: number;
  isLoading: boolean;
  error: string | null;
  hmsRoomState: string | null;
  localPeer: any | null;
  remotePeers: any[];
  allPeers: any[];
}

// Actions
type HMSCallAction =
  | { type: 'SET_STATE'; payload: CallState }
  | { type: 'SET_CURRENT_CALL'; payload: Call | null }
  | { type: 'SET_INCOMING_CALL'; payload: any | null }
  | { type: 'SET_AUDIO_ENABLED'; payload: boolean }
  | { type: 'SET_VIDEO_ENABLED'; payload: boolean }
  | { type: 'SET_CALL_DURATION'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_HMS_ROOM_STATE'; payload: string | null }
  | { type: 'SET_LOCAL_PEER'; payload: any }
  | { type: 'SET_REMOTE_PEERS'; payload: any[] }
  | { type: 'SET_ALL_PEERS'; payload: any[] }
  | { type: 'RESET_CALL' };

// Reducer
const hmsCallReducer = (state: HMSCallProviderState, action: HMSCallAction): HMSCallProviderState => {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, currentState: action.payload };
    case 'SET_CURRENT_CALL':
      return { ...state, currentCall: action.payload };
    case 'SET_INCOMING_CALL':
      return { ...state, incomingCall: action.payload };
    case 'SET_AUDIO_ENABLED':
      return { ...state, isAudioEnabled: action.payload };
    case 'SET_VIDEO_ENABLED':
      return { ...state, isVideoEnabled: action.payload };
    case 'SET_CALL_DURATION':
      return { ...state, callDuration: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_HMS_ROOM_STATE':
      return { ...state, hmsRoomState: action.payload };
    case 'SET_LOCAL_PEER':
      return { ...state, localPeer: action.payload };
    case 'SET_REMOTE_PEERS':
      return { ...state, remotePeers: action.payload };
    case 'SET_ALL_PEERS':
      return { ...state, allPeers: action.payload };
    case 'RESET_CALL':
      return {
        ...state,
        currentState: CallState.IDLE,
        currentCall: null,
        incomingCall: null,
        callDuration: 0,
        error: null,
        hmsRoomState: null,
        localPeer: null,
        remotePeers: [],
        allPeers: []
      };
    default:
      return state;
  }
};

// Initial state
const initialState: HMSCallProviderState = {
  currentState: CallState.IDLE,
  currentCall: null,
  incomingCall: null,
  isAudioEnabled: true,
  isVideoEnabled: true,
  callDuration: 0,
  isLoading: false,
  error: null,
  hmsRoomState: null,
  localPeer: null,
  remotePeers: [],
  allPeers: []
};

// Context interface
interface HMSCallContextType extends HMSCallProviderState {
  startVoiceCall: (receiverId: string, chatId: string, receiverName: string, receiverImage?: string) => Promise<void>;
  startVideoCall: (receiverId: string, chatId: string, receiverName: string, receiverImage?: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  retryConnection: () => Promise<void>;
  isInCall: boolean;
}

// Create context
const HMSCallContext = createContext<HMSCallContextType | undefined>(undefined);

// Provider component
export const HMSCallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(hmsCallReducer, initialState);
  let durationInterval: NodeJS.Timeout | null = null;

  // Subscribe to HMS store updates
  useEffect(() => {
    console.log('🏠 Setting up HMS store subscriptions...');

    // Subscribe to room state
    const unsubscribeRoomState = hmsService.subscribe(selectRoomState, (roomState: string) => {
      console.log('🏠 HMS Room state changed:', roomState);
      dispatch({ type: 'SET_HMS_ROOM_STATE', payload: roomState });
      
      // Auto state transition based on HMS room state
      if (roomState === 'Connected' && state.currentState === CallState.CONNECTING) {
        console.log('🎉 HMS: Auto-transitioning to CONNECTED state');
        dispatch({ type: 'SET_STATE', payload: CallState.CONNECTED });
      } else if (roomState === 'Failed') {
        console.log('❌ HMS: Auto-transitioning to FAILED state');
        dispatch({ type: 'SET_STATE', payload: CallState.FAILED });
      }
    });

    // Subscribe to local peer
    const unsubscribeLocalPeer = hmsService.subscribe(selectLocalPeer, (localPeer: any) => {
      dispatch({ type: 'SET_LOCAL_PEER', payload: localPeer });
    });

    // Subscribe to all peers
    const unsubscribePeers = hmsService.subscribe(selectPeers, (peers: any[]) => {
      dispatch({ type: 'SET_ALL_PEERS', payload: peers });
      const remotePeers = peers.filter(peer => !peer.isLocal);
      dispatch({ type: 'SET_REMOTE_PEERS', payload: remotePeers });
    });

    // Subscribe to errors
    const unsubscribeErrors = hmsService.subscribe(selectErrors, (errors: any) => {
      if (errors && errors.length > 0) {
        const latestError = errors[errors.length - 1];
        console.error('❌ HMS Error:', latestError);
        dispatch({ type: 'SET_ERROR', payload: latestError.message || 'Unknown HMS error' });
        dispatch({ type: 'SET_STATE', payload: CallState.FAILED });
      }
    });

    return () => {
      console.log('🧹 Cleaning up HMS subscriptions...');
      unsubscribeRoomState();
      unsubscribeLocalPeer();
      unsubscribePeers();
      unsubscribeErrors();
    };
  }, [state.currentState]);

  // Call duration timer
  useEffect(() => {
    if (state.currentState === CallState.CONNECTED) {
      durationInterval = setInterval(() => {
        dispatch({ type: 'SET_CALL_DURATION', payload: state.callDuration + 1 });
      }, 1000);
    } else {
      if (durationInterval) {
        clearInterval(durationInterval);
        durationInterval = null;
      }
    }

    return () => {
      if (durationInterval) {
        clearInterval(durationInterval);
      }
    };
  }, [state.currentState, state.callDuration]);

  // Initialize socket event handlers
  useEffect(() => {
    console.log('🔌 HMSCallProvider: Setting up socket event handlers');

    // Incoming call
    socketManager.on('incoming_call', (data) => {
      console.log('📞 HMSCallProvider: Incoming call received:', data);
      dispatch({ type: 'SET_INCOMING_CALL', payload: data });
      dispatch({ type: 'SET_STATE', payload: CallState.INCOMING });
      
      // Start ringtone
      ringtoneManager.startRingtone('incoming');
    });

    // Call accepted
    socketManager.on('call_accepted', (data) => {
      console.log('✅ HMSCallProvider: Call accepted:', data);
      if (state.currentCall && state.currentCall._id === data.callId) {
        dispatch({ type: 'SET_STATE', payload: CallState.CONNECTING });
        ringtoneManager.stopRingtone();
      }
    });

    // Call declined
    socketManager.on('call_declined', (data) => {
      console.log('❌ HMSCallProvider: Call declined:', data);
      const isCurrentCall = state.currentCall && state.currentCall._id === data.callId;
      const isIncomingCall = state.incomingCall && state.incomingCall.callId === data.callId;
      
      if (isCurrentCall || isIncomingCall) {
        dispatch({ type: 'SET_STATE', payload: CallState.ENDED });
        ringtoneManager.stopRingtone();
        
        // Leave HMS room if connected
        if (hmsService.isJoined()) {
          hmsService.leaveRoom().catch(console.error);
        }
        
        setTimeout(() => dispatch({ type: 'RESET_CALL' }), 500);
      }
    });

    // Call ended
    socketManager.on('call_ended', (data) => {
      console.log('🔚 HMSCallProvider: Call ended:', data);
      const isCurrentCall = state.currentCall && state.currentCall._id === data.callId;
      const isIncomingCall = state.incomingCall && state.incomingCall.callId === data.callId;
      
      if (isCurrentCall || isIncomingCall) {
        dispatch({ type: 'SET_STATE', payload: CallState.ENDED });
        ringtoneManager.stopRingtone();
        
        // Leave HMS room if connected
        if (hmsService.isJoined()) {
          hmsService.leaveRoom().catch(console.error);
        }
        
        setTimeout(() => dispatch({ type: 'RESET_CALL' }), 500);
      }
    });

    return () => {
      socketManager.off('incoming_call');
      socketManager.off('call_accepted');
      socketManager.off('call_declined');
      socketManager.off('call_ended');
    };
  }, [state.currentCall]);

  // Start voice call
  const startVoiceCall = useCallback(async (
    receiverId: string,
    chatId: string,
    receiverName: string,
    receiverImage?: string
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_STATE', payload: CallState.CALLING });

      console.log('📞 HMSCallProvider: Starting voice call to:', receiverName);

      // Create call on backend
      const call = await callAPI.initiateCall({
        receiverId,
        chatId,
        callType: 'voice'
      });

      dispatch({ type: 'SET_CURRENT_CALL', payload: call });
      dispatch({ type: 'SET_VIDEO_ENABLED', payload: false });

      // Get HMS token and join room
      const tokenData = await getHMSToken(call._id, 'host');
      await hmsService.joinRoom(call._id, {
        userName: receiverName,
        authToken: tokenData.authToken
      }, {
        audio: true,
        video: false
      });

      // Emit call initiation
      socketManager.initiateCall(receiverId, chatId, 'voice', call._id);
      
      // Start outgoing ringtone
      ringtoneManager.startRingtone('outgoing');

    } catch (error) {
      console.error('❌ HMSCallProvider: Error starting voice call:', error);
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      dispatch({ type: 'SET_STATE', payload: CallState.FAILED });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Start video call
  const startVideoCall = useCallback(async (
    receiverId: string,
    chatId: string,
    receiverName: string,
    receiverImage?: string
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_STATE', payload: CallState.CALLING });

      console.log('📹 HMSCallProvider: Starting video call to:', receiverName);

      // Create call on backend
      const call = await callAPI.initiateCall({
        receiverId,
        chatId,
        callType: 'video'
      });

      dispatch({ type: 'SET_CURRENT_CALL', payload: call });
      dispatch({ type: 'SET_VIDEO_ENABLED', payload: true });

      // Get HMS token and join room
      const tokenData = await getHMSToken(call._id, 'host');
      await hmsService.joinRoom(call._id, {
        userName: receiverName,
        authToken: tokenData.authToken
      }, {
        audio: true,
        video: true
      });

      // Emit call initiation
      socketManager.initiateCall(receiverId, chatId, 'video', call._id);
      
      // Start outgoing ringtone
      ringtoneManager.startRingtone('outgoing');

    } catch (error) {
      console.error('❌ HMSCallProvider: Error starting video call:', error);
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      dispatch({ type: 'SET_STATE', payload: CallState.FAILED });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Accept call
  const acceptCall = useCallback(async () => {
    if (!state.incomingCall) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_STATE', payload: CallState.CONNECTING });
      
      ringtoneManager.stopRingtone();

      console.log('✅ HMSCallProvider: Accepting call:', state.incomingCall.callId);

      // Accept on backend
      const call = await callAPI.acceptCall(state.incomingCall.callId);
      dispatch({ type: 'SET_CURRENT_CALL', payload: call });
      dispatch({ type: 'SET_VIDEO_ENABLED', payload: state.incomingCall.callType === 'video' });

      // Get HMS token and join room
      const tokenData = await getHMSToken(state.incomingCall.callId, 'guest');
      await hmsService.joinRoom(state.incomingCall.callId, {
        userName: state.incomingCall.caller.fullName || state.incomingCall.caller.username,
        authToken: tokenData.authToken
      }, {
        audio: true,
        video: state.incomingCall.callType === 'video'
      });

      // Emit acceptance
      socketManager.acceptCall(state.incomingCall.callId, state.incomingCall.caller._id);
      
      dispatch({ type: 'SET_INCOMING_CALL', payload: null });

    } catch (error) {
      console.error('❌ HMSCallProvider: Error accepting call:', error);
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      dispatch({ type: 'SET_STATE', payload: CallState.FAILED });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.incomingCall]);

  // Decline call
  const declineCall = useCallback(async () => {
    if (!state.incomingCall) return;

    try {
      console.log('🔴 HMSCallProvider: Declining call:', state.incomingCall.callId);
      ringtoneManager.stopRingtone();
      
      // Immediately clear the modal by resetting state
      dispatch({ type: 'RESET_CALL' });
      
      // Decline on backend
      await callAPI.declineCall(state.incomingCall.callId);
      
      // Emit decline
      socketManager.declineCall(state.incomingCall.callId, state.incomingCall.caller._id);
    } catch (error) {
      console.error('❌ HMSCallProvider: Error declining call:', error);
    }
  }, [state.incomingCall]);

  // End call
  const endCall = useCallback(async () => {
    if (!state.currentCall) return;

    try {
      ringtoneManager.stopRingtone();
      
      // Leave HMS room first
      if (hmsService.isJoined()) {
        await hmsService.leaveRoom();
      }
      
      // End on backend
      await callAPI.endCall(state.currentCall._id, { endReason: 'normal' });
      
      // Emit end
      const participantIds = state.currentCall.participants.map(p => p._id);
      socketManager.endCall(state.currentCall._id, participantIds, 'normal');
      
      dispatch({ type: 'SET_STATE', payload: CallState.ENDED });
      
      setTimeout(() => dispatch({ type: 'RESET_CALL' }), 500);
    } catch (error) {
      console.error('❌ HMSCallProvider: Error ending call:', error);
    }
  }, [state.currentCall]);

  // Toggle audio
  const toggleAudio = useCallback(async () => {
    try {
      const newState = !state.isAudioEnabled;
      await hmsService.toggleAudio(newState);
      dispatch({ type: 'SET_AUDIO_ENABLED', payload: newState });
    } catch (error) {
      console.error('❌ HMSCallProvider: Error toggling audio:', error);
    }
  }, [state.isAudioEnabled]);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    try {
      const newState = !state.isVideoEnabled;
      await hmsService.toggleVideo(newState);
      dispatch({ type: 'SET_VIDEO_ENABLED', payload: newState });
    } catch (error) {
      console.error('❌ HMSCallProvider: Error toggling video:', error);
    }
  }, [state.isVideoEnabled]);

  // Retry connection
  const retryConnection = useCallback(async () => {
    if (state.currentCall) {
      console.log('🔄 HMSCallProvider: Retrying connection');
      dispatch({ type: 'SET_STATE', payload: CallState.CONNECTING });
      // HMS will handle the retry automatically
    }
  }, [state.currentCall]);

  const contextValue: HMSCallContextType = {
    ...state,
    startVoiceCall,
    startVideoCall,
    acceptCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo,
    retryConnection,
    isInCall: state.currentState !== CallState.IDLE && state.currentState !== CallState.ENDED
  };

  return (
    <HMSCallContext.Provider value={contextValue}>
      {children}
    </HMSCallContext.Provider>
  );
};

// Hook to use HMS call context
export const useHMSCall = (): HMSCallContextType => {
  const context = useContext(HMSCallContext);
  if (!context) {
    throw new Error('useHMSCall must be used within an HMSCallProvider');
  }
  return context;
};