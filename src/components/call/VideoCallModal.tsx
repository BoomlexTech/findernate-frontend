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
  callType?: 'default' | 'audio';
}

const CallLayout = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Connecting to call...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition='bottom' />
      <CallControls />
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
  callType = 'default'
}) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    const user: User = {
      id: userId,
      name: userName,
      image: userImage || `https://getstream.io/random_svg/?id=${userId}&name=${userName}`,
    };

    // Initialize Stream Video client
    const videoClient = new StreamVideoClient({ apiKey, user, token });
    setClient(videoClient);

    // Create and join call
    const videoCall = videoClient.call(callType, callId);
    videoCall.join({ create: true });
    setCall(videoCall);

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
  }, [isOpen, apiKey, token, userId, userName, userImage, callId, callType]);

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
                <CallLayout />
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
