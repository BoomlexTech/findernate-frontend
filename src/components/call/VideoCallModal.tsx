'use client';

import React, { useEffect, useState } from 'react';
import {
  CallControls,
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
  type User
} from '@stream-io/video-react-sdk';
import { X } from 'lucide-react';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  token: string;
  userId: string;
  userName: string;
  userImage?: string;
  callId: string;
  callType?: 'voice' | 'video';
  streamCallType?: 'audio_room' | 'default';
}

const CallLayout: React.FC<{ callType?: 'voice' | 'video' }> = ({ callType = 'video' }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">
            Connecting to {callType === 'voice' ? 'voice' : 'video'} call...
          </p>
        </div>
      </div>
    );
  }

  return (
    <StreamTheme>
      {callType === 'voice' ? (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 mx-auto animate-pulse">
              <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p className="text-white text-xl mb-2">Voice Call in Progress</p>
            <p className="text-gray-400 text-sm">Audio only</p>
          </div>
          <div className="mt-8">
            <CallControls />
          </div>
        </div>
      ) : (
        <>
          <SpeakerLayout participantsBarPosition='bottom' />
          <CallControls />
        </>
      )}
    </StreamTheme>
  );
};

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  token,
  userId,
  userName,
  userImage,
  callId,
  callType = 'video',
  streamCallType = 'default'
}) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Don't initialize Stream.io if we're still connecting (waiting for real callId)
    if (callId === 'connecting') {
      return;
    }

    // Declare these outside async function so cleanup can access them
    let videoClient: StreamVideoClient | null = null;
    let videoCall: any = null;

    const initializeCall = async () => {
      try {
        const user: User = {
          id: userId,
          name: userName,
          image: userImage || `https://getstream.io/random_svg/?id=${userId}&name=${userName}`,
        };

        // Initialize Stream Video client
        console.log('📞 Initializing Stream.io client...');
        videoClient = new StreamVideoClient({ apiKey, user, token });
        setClient(videoClient);

        // Use the streamCallType from backend
        // Backend returns 'audio_room' for voice calls, 'default' for video calls
        // This ensures proper Stream.io configuration for each call type
        console.log('📞 Using Stream.io call type:', streamCallType);

        // Get the existing call that was already created by backend
        videoCall = videoClient.call(streamCallType, callId);

        // Set call state immediately for faster UI
        setCall(videoCall);

        // Join the existing call in the background (don't block UI)
        console.log('📞 Joining existing call...');
        videoCall.join({ create: false })
          .then(() => {
            console.log('📞 Successfully joined call!');

            // Disable camera for voice calls after joining
            if (callType === 'voice') {
              videoCall.camera.disable()
                .then(() => console.log('📞 Camera disabled for voice call'))
                .catch((err) => console.warn('Failed to disable camera for voice call:', err));
            }
          })
          .catch((error) => {
            console.error('📞 Failed to join call:', error);
            alert('Failed to join call. Please try again.');
            onClose();
          });
      } catch (error) {
        console.error('📞 Failed to initialize call:', error);
        // Show error to user
        alert('Failed to initialize call. Please check your connection and try again.');
        // Close the modal on error
        onClose();
      }
    };

    initializeCall();

    return () => {
      // Cleanup on unmount - use parallel cleanup with timeout
      const cleanupPromises: Promise<unknown>[] = [];

      if (videoCall) {
        cleanupPromises.push(
          Promise.race([
            videoCall.leave(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]).catch((err) => console.warn('Call cleanup on unmount failed:', err))
        );
      }

      if (videoClient) {
        cleanupPromises.push(
          Promise.race([
            videoClient.disconnectUser(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]).catch((err) => console.warn('Client cleanup on unmount failed:', err))
        );
      }

      if (cleanupPromises.length > 0) {
        Promise.allSettled(cleanupPromises).then(() => {
          console.log('📞 Cleanup on unmount completed');
        });
      }
    };
  }, [isOpen, apiKey, token, userId, userName, userImage, callId, callType, streamCallType, onClose]);

  const handleClose = async () => {
    // Optimistic UI update - close modal immediately for better UX
    onClose();

    // Helper function to add timeout to promises
    const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
        ),
      ]);
    };

    try {
      // Parallelize cleanup operations with timeout protection
      const cleanupPromises: Promise<unknown>[] = [];

      if (call) {
        cleanupPromises.push(
          withTimeout(call.leave(), 5000).catch((err) => {
            console.warn('Call leave failed or timed out:', err);
          })
        );
      }

      if (client) {
        cleanupPromises.push(
          withTimeout(client.disconnectUser(), 5000).catch((err) => {
            console.warn('Client disconnect failed or timed out:', err);
          })
        );
      }

      // Wait for all cleanup operations to complete (or timeout)
      await Promise.allSettled(cleanupPromises);
      console.log('📞 Call cleanup completed');
    } catch (error) {
      console.error('Error during call cleanup:', error);
      // UI already closed, so just log the error
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative w-full h-full max-w-7xl max-h-screen p-4">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-50 p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          title="End call"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Video call container */}
        <div className="w-full h-full rounded-lg overflow-hidden bg-gray-900">
          {client && call ? (
            <StreamVideo client={client}>
              <StreamCall call={call}>
                <CallLayout callType={callType} />
              </StreamCall>
            </StreamVideo>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-white text-lg">Initializing call...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
