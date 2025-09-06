'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { webRTCManager } from '@/utils/webrtc';
import { socketManager } from '@/utils/socket';
import { callAPI, Call } from '@/api/call';
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

// Call provider state
interface CallProviderState {
  currentState: CallState;
  currentCall: Call | null;
  incomingCall: any | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  callDuration: number;
  isLoading: boolean;
  error: string | null;
}

// Actions
type CallAction =
  | { type: 'SET_STATE'; payload: CallState }
  | { type: 'SET_CURRENT_CALL'; payload: Call | null }
  | { type: 'SET_INCOMING_CALL'; payload: any | null }
  | { type: 'SET_LOCAL_STREAM'; payload: MediaStream | null }
  | { type: 'SET_REMOTE_STREAM'; payload: MediaStream | null }
  | { type: 'SET_CONNECTION_STATE'; payload: RTCPeerConnectionState | null }
  | { type: 'SET_AUDIO_ENABLED'; payload: boolean }
  | { type: 'SET_VIDEO_ENABLED'; payload: boolean }
  | { type: 'SET_CALL_DURATION'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_CALL' };

// Reducer
const callReducer = (state: CallProviderState, action: CallAction): CallProviderState => {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, currentState: action.payload };
    case 'SET_CURRENT_CALL':
      return { ...state, currentCall: action.payload };
    case 'SET_INCOMING_CALL':
      return { ...state, incomingCall: action.payload };
    case 'SET_LOCAL_STREAM':
      return { ...state, localStream: action.payload };
    case 'SET_REMOTE_STREAM':
      return { ...state, remoteStream: action.payload };
    case 'SET_CONNECTION_STATE':
      return { ...state, connectionState: action.payload };
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
    case 'RESET_CALL':
      return {
        ...state,
        currentState: CallState.IDLE,
        currentCall: null,
        incomingCall: null,
        localStream: null,
        remoteStream: null,
        connectionState: null,
        callDuration: 0,
        error: null
      };
    default:
      return state;
  }
};

// Initial state
const initialState: CallProviderState = {
  currentState: CallState.IDLE,
  currentCall: null,
  incomingCall: null,
  localStream: null,
  remoteStream: null,
  connectionState: null,
  isAudioEnabled: true,
  isVideoEnabled: true,
  callDuration: 0,
  isLoading: false,
  error: null
};

// Context interface
interface CallContextType extends CallProviderState {
  startVoiceCall: (receiverId: string, chatId: string, receiverName: string, receiverImage?: string) => Promise<void>;
  startVideoCall: (receiverId: string, chatId: string, receiverName: string, receiverImage?: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleAudio: () => void;
  toggleVideo: () => void;
  retryConnection: () => Promise<void>;
}

// Create context
const CallContext = createContext<CallContextType | undefined>(undefined);

// Provider component
export const CallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(callReducer, initialState);
  let durationInterval: NodeJS.Timeout | null = null;

  // Auto state transition based on WebRTC connection state
  useEffect(() => {
    if (state.connectionState === 'connected' && state.currentState === CallState.CONNECTING) {
      //console.log('🎉 CallProvider: Auto-transitioning to CONNECTED state');
      dispatch({ type: 'SET_STATE', payload: CallState.CONNECTED });
    } else if (state.connectionState === 'failed') {
      //console.log('❌ CallProvider: Auto-transitioning to FAILED state');
      dispatch({ type: 'SET_STATE', payload: CallState.FAILED });
    }
  }, [state.connectionState, state.currentState]);

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

  // Initialize WebRTC event handlers
  useEffect(() => {
    //console.log('🎯 CallProvider: Setting up WebRTC event handlers');

    // Remote stream handler
    webRTCManager.onRemoteStream((stream) => {
      //console.log('📺 CallProvider: Remote stream received');
      dispatch({ type: 'SET_REMOTE_STREAM', payload: stream });
    });

    // Connection state handler
    webRTCManager.onConnectionStateChange((connectionState) => {
      //console.log('🔗 CallProvider: Connection state changed to:', connectionState);
      dispatch({ type: 'SET_CONNECTION_STATE', payload: connectionState });
    });

    // Error handler
    webRTCManager.onError((error) => {
      console.error('❌ CallProvider: WebRTC error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_STATE', payload: CallState.FAILED });
    });

    return () => {
      //console.log('🧹 CallProvider: Cleaning up WebRTC handlers');
    };
  }, []);

  // Initialize socket event handlers
  useEffect(() => {
    //console.log('🔌 CallProvider: Setting up socket event handlers');

    // Incoming call
    socketManager.on('incoming_call', (data) => {
      //console.log('📞 CallProvider: Incoming call received:', data);
      dispatch({ type: 'SET_INCOMING_CALL', payload: data });
      dispatch({ type: 'SET_STATE', payload: CallState.INCOMING });
      
      // Prepare WebRTC manager
      webRTCManager.prepareForIncomingCall(data.callId, data.caller._id);
      
      // Start ringtone
      ringtoneManager.startRingtone('incoming');
    });

    // Call accepted
    socketManager.on('call_accepted', (data) => {
      //console.log('✅ CallProvider: Call accepted:', data);
      if (state.currentCall && state.currentCall._id === data.callId) {
        dispatch({ type: 'SET_STATE', payload: CallState.CONNECTING });
        ringtoneManager.stopRingtone();
        
        // Send pending offer
        webRTCManager.sendPendingOffer();
      }
    });

    // Call declined
    socketManager.on('call_declined', (data) => {
      //console.log('❌ CallProvider: Call declined:', data);
      const isCurrentCall = state.currentCall && state.currentCall._id === data.callId;
      const isIncomingCall = state.incomingCall && state.incomingCall.callId === data.callId;
      
      if (isCurrentCall || isIncomingCall) {
        dispatch({ type: 'SET_STATE', payload: CallState.ENDED });
        ringtoneManager.stopRingtone();
        
        // Clear the modal immediately instead of waiting 2 seconds
        setTimeout(() => dispatch({ type: 'RESET_CALL' }), 500);
      }
    });

    // Call ended
    socketManager.on('call_ended', (data) => {
      //console.log('🔚 CallProvider: Call ended:', data);
      const isCurrentCall = state.currentCall && state.currentCall._id === data.callId;
      const isIncomingCall = state.incomingCall && state.incomingCall.callId === data.callId;
      
      if (isCurrentCall || isIncomingCall) {
        dispatch({ type: 'SET_STATE', payload: CallState.ENDED });
        ringtoneManager.stopRingtone();
        webRTCManager.endCall();
        
        // Clear the modal immediately instead of waiting 2 seconds
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

      //console.log('📞 CallProvider: Starting voice call to:', receiverName);

      // Create call on backend
      const call = await callAPI.initiateCall({
        receiverId,
        chatId,
        callType: 'voice'
      });

      dispatch({ type: 'SET_CURRENT_CALL', payload: call });
      dispatch({ type: 'SET_VIDEO_ENABLED', payload: false });

      // Initialize local stream
      const localStream = await webRTCManager.initializeLocalStream({
        audio: true,
        video: false
      });
      dispatch({ type: 'SET_LOCAL_STREAM', payload: localStream });

      // Start WebRTC call
      await webRTCManager.startCall(call._id, receiverId, {
        audio: true,
        video: false
      });

      // Emit call initiation
      socketManager.initiateCall(receiverId, chatId, 'voice', call._id);
      
      // Start outgoing ringtone
      ringtoneManager.startRingtone('outgoing');

    } catch (error) {
      console.error('❌ CallProvider: Error starting voice call:', error);
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

      //console.log('📹 CallProvider: Starting video call to:', receiverName);

      // Create call on backend
      const call = await callAPI.initiateCall({
        receiverId,
        chatId,
        callType: 'video'
      });

      dispatch({ type: 'SET_CURRENT_CALL', payload: call });
      dispatch({ type: 'SET_VIDEO_ENABLED', payload: true });

      // Initialize local stream
      const localStream = await webRTCManager.initializeLocalStream({
        audio: true,
        video: true
      });
      dispatch({ type: 'SET_LOCAL_STREAM', payload: localStream });

      // Start WebRTC call
      await webRTCManager.startCall(call._id, receiverId, {
        audio: true,
        video: true
      });

      // Emit call initiation
      socketManager.initiateCall(receiverId, chatId, 'video', call._id);
      
      // Start outgoing ringtone
      ringtoneManager.startRingtone('outgoing');

    } catch (error) {
      console.error('❌ CallProvider: Error starting video call:', error);
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

      //console.log('✅ CallProvider: Accepting call:', state.incomingCall.callId);

      // Accept on backend
      const call = await callAPI.acceptCall(state.incomingCall.callId);
      dispatch({ type: 'SET_CURRENT_CALL', payload: call });
      dispatch({ type: 'SET_VIDEO_ENABLED', payload: state.incomingCall.callType === 'video' });

      // Initialize local stream
      const localStream = await webRTCManager.initializeLocalStream({
        audio: true,
        video: state.incomingCall.callType === 'video'
      });
      dispatch({ type: 'SET_LOCAL_STREAM', payload: localStream });

      // Accept WebRTC call
      await webRTCManager.acceptCall(state.incomingCall.callId, {
        audio: true,
        video: state.incomingCall.callType === 'video'
      });

      // Emit acceptance
      socketManager.acceptCall(state.incomingCall.callId, state.incomingCall.caller._id);
      
      dispatch({ type: 'SET_INCOMING_CALL', payload: null });

    } catch (error) {
      console.error('❌ CallProvider: Error accepting call:', error);
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
      //console.log('🔴 CallProvider: Declining call:', state.incomingCall.callId);
      ringtoneManager.stopRingtone();
      
      // Immediately clear the modal by resetting state
      dispatch({ type: 'RESET_CALL' });
      //console.log('🔴 CallProvider: Call state reset after decline');
      
      // Decline on backend
      await callAPI.declineCall(state.incomingCall.callId);
      
      // Emit decline
      socketManager.declineCall(state.incomingCall.callId, state.incomingCall.caller._id);
    } catch (error) {
      console.error('❌ CallProvider: Error declining call:', error);
    }
  }, [state.incomingCall]);

  // End call
  const endCall = useCallback(async () => {
    if (!state.currentCall) return;

    try {
      ringtoneManager.stopRingtone();
      
      // End on backend
      await callAPI.endCall(state.currentCall._id, { endReason: 'normal' });
      
      // Emit end
      const participantIds = state.currentCall.participants.map(p => p._id);
      socketManager.endCall(state.currentCall._id, participantIds, 'normal');
      
      // End WebRTC
      webRTCManager.endCall();
      
      dispatch({ type: 'SET_STATE', payload: CallState.ENDED });
      
      // Clear modal faster for better UX
      setTimeout(() => dispatch({ type: 'RESET_CALL' }), 500);
    } catch (error) {
      console.error('❌ CallProvider: Error ending call:', error);
    }
  }, [state.currentCall]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    const newState = !state.isAudioEnabled;
    webRTCManager.toggleAudio(newState);
    dispatch({ type: 'SET_AUDIO_ENABLED', payload: newState });
  }, [state.isAudioEnabled]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    const newState = !state.isVideoEnabled;
    webRTCManager.toggleVideo(newState);
    dispatch({ type: 'SET_VIDEO_ENABLED', payload: newState });
  }, [state.isVideoEnabled]);

  // Retry connection
  const retryConnection = useCallback(async () => {
    if (state.currentCall) {
      //console.log('🔄 CallProvider: Retrying connection');
      dispatch({ type: 'SET_STATE', payload: CallState.CONNECTING });
      // WebRTC manager will handle the retry
    }
  }, [state.currentCall]);

  const contextValue: CallContextType = {
    ...state,
    startVoiceCall,
    startVideoCall,
    acceptCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo,
    retryConnection
  };

  return (
    <CallContext.Provider value={contextValue}>
      {children}
    </CallContext.Provider>
  );
};

// Hook to use call context
export const useCall = (): CallContextType => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};