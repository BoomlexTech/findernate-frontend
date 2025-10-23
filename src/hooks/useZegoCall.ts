'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ZegoExpressEngine } from 'zego-express-engine-webrtc';

// Define ZegoUser type locally since the SDK doesn't export it properly
interface ZegoUser {
  userID: string;
  userName: string;
}

export interface ZegoCallConfig {
  appId: number;
  server: string;
  roomId: string;
  token: string;
  userId: string;
  userName: string;
  callType: 'voice' | 'video';
}

export interface UseZegoCallReturn {
  isInitialized: boolean;
  isInCall: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
  error: string | null;
  joinCall: (config: ZegoCallConfig) => Promise<void>;
  leaveCall: () => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => void;
  refreshToken: (newToken: string) => Promise<void>;
}

export const useZegoCall = (): UseZegoCallReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'unknown'>('unknown');
  const [error, setError] = useState<string | null>(null);

  const zegoRef = useRef<ZegoExpressEngine | null>(null);
  const currentConfigRef = useRef<ZegoCallConfig | null>(null);
  const localStreamIdRef = useRef<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Initialize ZegoCloud Engine
  const initializeZego = useCallback(async (appId: number, server: string) => {
    try {
      if (zegoRef.current) {
        console.log('🎥 ZegoCloud already initialized');
        return zegoRef.current;
      }

      // Only run on client-side
      if (typeof window === 'undefined') {
        throw new Error('ZegoCloud can only be initialized on the client-side');
      }

      console.log('🎥 Initializing ZegoCloud Engine...');

      // Dynamically import ZegoCloud SDK to avoid SSR issues
      const { ZegoExpressEngine } = await import('zego-express-engine-webrtc');

      const zg = new ZegoExpressEngine(appId, server);
      zegoRef.current = zg;
      setIsInitialized(true);
      console.log('✅ ZegoCloud initialized successfully');
      return zg;
    } catch (err: any) {
      console.error('❌ Failed to initialize ZegoCloud:', err);
      setError(`Failed to initialize: ${err.message}`);
      throw err;
    }
  }, []);

  // Join call
  const joinCall = useCallback(async (config: ZegoCallConfig) => {
    try {
      setIsConnecting(true);
      setError(null);
      console.log('📞 Joining call with config:', { ...config, token: '***' });

      // Initialize engine if not already initialized
      const zg = zegoRef.current || await initializeZego(config.appId, config.server);
      currentConfigRef.current = config;

      // Login to room
      console.log('🔐 Logging into room:', config.roomId);
      const user: ZegoUser = {
        userID: config.userId,
        userName: config.userName
      };

      await zg.loginRoom(
        config.roomId,
        config.token,
        user,
        { userUpdate: true }
      );

      console.log('✅ Successfully logged into room');

      // Create and publish local stream
      console.log('🎬 Creating local stream...');
      const stream = await zg.createStream({
        camera: {
          audio: true,
          video: config.callType === 'video',
          videoQuality: 4, // 720p
          width: 1280,
          height: 720,
          frameRate: 30
          //fixes
        }
      });

      setLocalStream(stream);
      console.log('✅ Local stream created');

      // Publish stream
      const streamId = `stream_${config.userId}_${Date.now()}`;
      localStreamIdRef.current = streamId;

      console.log('📤 Publishing stream:', streamId);
      await zg.startPublishingStream(streamId, stream);
      console.log('✅ Stream published successfully');

      // Listen for remote streams
      zg.on('roomStreamUpdate', async (roomID, updateType, streamList, extendedData) => {
        console.log('📡 Room stream update:', updateType, streamList);

        if (updateType === 'ADD') {
          for (const streamInfo of streamList) {
            try {
              console.log('🎥 Playing remote stream:', streamInfo.streamID);
              const remoteStream = await zg.startPlayingStream(streamInfo.streamID);
              setRemoteStream(remoteStream);
              console.log('✅ Remote stream playing');
            } catch (err) {
              console.error('❌ Failed to play remote stream:', err);
            }
          }
        } else if (updateType === 'DELETE') {
          console.log('🔇 Remote stream removed');
          for (const streamInfo of streamList) {
            zg.stopPlayingStream(streamInfo.streamID);
          }
          setRemoteStream(null);
        }
      });

      // Listen for room user updates
      zg.on('roomUserUpdate', (roomID, updateType, userList) => {
        console.log('👥 Room user update:', updateType, userList);
      });

      // Listen for connection quality
      zg.on('publishQualityUpdate', (streamID, stats) => {
        const quality = stats.video.videoQuality;
        if (quality >= 3) {
          setConnectionQuality('excellent');
        } else if (quality >= 2) {
          setConnectionQuality('good');
        } else {
          setConnectionQuality('poor');
        }
      });

      // Note: ZegoCloud SDK might not have 'error' event in types
      // Errors are typically caught in try-catch blocks instead

      setIsInCall(true);
      setIsConnecting(false);
      console.log('✅ Successfully joined call');

    } catch (err: any) {
      console.error('❌ Failed to join call:', err);

      // Capture detailed error information
      const errorCode = err.code || err.errorCode || 'UNKNOWN';
      const errorMsg = err.message || err.msg || 'Unknown error';
      const errorDetails = {
        code: errorCode,
        message: errorMsg,
        config: { ...config, token: '***' }
      };

      console.error('📋 Error details:', errorDetails);

      // User-friendly error messages based on error code
      let userMessage = `Failed to join call: ${errorMsg}`;
      if (errorCode === 1102016 || errorCode === 50119) {
        userMessage = 'Authentication failed. Please try again or contact support.';
      } else if (errorCode === 1102015) {
        userMessage = 'Invalid room configuration. Please try again.';
      } else if (errorCode === 1000001) {
        userMessage = 'Network connection failed. Please check your internet.';
      }

      setError(userMessage);
      setIsConnecting(false);
      setIsInCall(false);
      throw err;
    }
  }, [initializeZego]);

  // Leave call
  const leaveCall = useCallback(async () => {
    try {
      console.log('📞 Leaving call...');
      const zg = zegoRef.current;
      const config = currentConfigRef.current;

      if (!zg || !config) {
        console.log('⚠️ No active call to leave');
        return;
      }

      // Stop publishing
      if (localStreamIdRef.current) {
        console.log('🛑 Stopping stream publication');
        await zg.stopPublishingStream(localStreamIdRef.current);
        localStreamIdRef.current = null;
      }

      // Destroy local stream
      if (localStream) {
        console.log('🗑️ Destroying local stream');
        await zg.destroyStream(localStream);
        setLocalStream(null);
      }

      // Logout from room
      console.log('🚪 Logging out from room');
      await zg.logoutRoom(config.roomId);

      setIsInCall(false);
      setRemoteStream(null);
      currentConfigRef.current = null;
      setConnectionQuality('unknown');
      console.log('✅ Successfully left call');

    } catch (err: any) {
      console.error('❌ Failed to leave call:', err);
      setError(`Failed to leave call: ${err.message}`);
    }
  }, [localStream]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const zg = zegoRef.current;
    if (!zg || !localStream) return;

    try {
      const newMutedState = !isMuted;
      zg.mutePublishStreamAudio(localStream, newMutedState);
      setIsMuted(newMutedState);
      console.log(`🔇 Audio ${newMutedState ? 'muted' : 'unmuted'}`);
    } catch (err) {
      console.error('❌ Failed to toggle mute:', err);
    }
  }, [isMuted, localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    const zg = zegoRef.current;
    if (!zg || !localStream) return;

    try {
      const newVideoState = !isVideoEnabled;
      zg.mutePublishStreamVideo(localStream, !newVideoState);
      setIsVideoEnabled(newVideoState);
      console.log(`📹 Video ${newVideoState ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error('❌ Failed to toggle video:', err);
    }
  }, [isVideoEnabled, localStream]);

  // Refresh token
  const refreshToken = useCallback(async (newToken: string) => {
    const zg = zegoRef.current;
    const config = currentConfigRef.current;

    if (!zg || !config) {
      console.error('❌ Cannot refresh token: not in a call');
      return;
    }

    try {
      console.log('🔄 Refreshing token...');
      // Note: ZegoCloud doesn't have a direct refresh method
      // We need to re-login with the new token
      await zg.logoutRoom(config.roomId);

      const user: ZegoUser = {
        userID: config.userId,
        userName: config.userName
      };

      await zg.loginRoom(
        config.roomId,
        newToken,
        user,
        { userUpdate: true }
      );

      if (currentConfigRef.current) {
        currentConfigRef.current.token = newToken;
      }
      console.log('✅ Token refreshed successfully');
    } catch (err: any) {
      console.error('❌ Failed to refresh token:', err);
      setError(`Failed to refresh token: ${err.message}`);
      throw err;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInCall) {
        console.log('🧹 Cleaning up on unmount');
        leaveCall();
      }
    };
  }, [isInCall, leaveCall]);

  return {
    isInitialized,
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
  };
};
