'use client';

import React, { useEffect, useState } from 'react';
import {
  CallingState,
  CallControls,
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
      <div className="w-full h-full flex flex-col" style={{ maxWidth: '100%', width: '100%' }}>
        {/* Video area - force full width */}
        <div className="flex-1 overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
          <div style={{ width: '100%', height: '100%', maxWidth: '100%' }}>
            <SpeakerLayout participantsBarPosition="top" />
          </div>
        </div>

        {/* Control buttons - inside the same StreamCall context */}
        <div className="flex-shrink-0 flex items-center justify-center py-6 bg-gray-800/90 backdrop-blur-sm">
          <CallControls />
        </div>
      </div>
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
        // Backend returns 'default' for both voice and video calls
        // Video is controlled through settings (disabled for voice calls)
        console.log('📞 Using Stream.io call type:', streamCallType);

        // Get the existing call that was already created by backend
        videoCall = videoClient.call(streamCallType, callId);

        // Set call state immediately for faster UI
        setCall(videoCall);

        // Step 1: Set camera facing mode BEFORE joining
        if (callType === 'video') {
          try {
            // Set preferred camera to front camera before joining
            await videoCall.camera.setSettings({
              preferredFacingMode: 'user' // Front camera (selfie camera on mobile)
            });
            console.log('📞 Camera settings configured for front camera');
          } catch (settingsError) {
            console.warn('Failed to set camera settings:', settingsError);
          }
        }

        // Step 2: Join the call
        console.log('📞 Joining existing call...');
        await videoCall.join({
          create: false
        });

        console.log('📞 Successfully joined call!');

        // Step 3: Enable microphone
        try {
          await videoCall.microphone.enable();
          console.log('📞 Microphone enabled');

          // Debug: Check microphone state
          const micState = videoCall.microphone.state;
          console.log('📞 Microphone state:', micState);

          // Debug: Check if audio track is publishing
          const localParticipant = videoCall.state.localParticipant;
          console.log('📞 Local participant:', localParticipant);
          console.log('📞 Audio publishing:', localParticipant?.publishedTracks);

        } catch (micError) {
          console.error('❌ Failed to enable microphone:', micError);
          alert('Failed to enable microphone. Please check your microphone permissions.');
        }

        // Step 4: Enable/disable camera based on call type
        if (callType === 'video') {
          try {
            // Get list of available cameras
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            console.log('📞 Available cameras:', videoDevices.map(d => ({ label: d.label, id: d.deviceId })));

            // Find front camera (usually labeled with "front" or comes first on mobile)
            // On mobile, front camera typically has "front" in label or is the first device
            let frontCamera = videoDevices.find(device =>
              device.label.toLowerCase().includes('front') ||
              device.label.toLowerCase().includes('user') ||
              device.label.toLowerCase().includes('facing')
            );

            // If no explicit front camera found, use the first one (usually front on mobile)
            if (!frontCamera && videoDevices.length > 0) {
              frontCamera = videoDevices[0];
            }

            // Enable camera with preference for front camera
            if (frontCamera) {
              console.log('📞 Using camera:', frontCamera.label, frontCamera.deviceId);
              await videoCall.camera.enable({
                deviceId: frontCamera.deviceId
              });
            } else {
              // Fallback: enable with facingMode constraint
              await videoCall.camera.enable();
            }

            console.log('📞 Camera enabled for video call (front camera)');

            // Debug: Check camera state
            const cameraState = videoCall.camera.state;
            console.log('📞 Camera state:', cameraState);

          } catch (cameraError) {
            console.error('❌ Failed to enable camera:', cameraError);
            alert('Failed to enable camera. Please check your camera permissions.');
          }
        } else {
          try {
            await videoCall.camera.disable();
            console.log('📞 Camera disabled for voice call');
          } catch (err) {
            console.warn('Failed to disable camera for voice call:', err);
          }
        }

        // Small delay to let media streams activate
        await new Promise(resolve => setTimeout(resolve, 300));

        // Debug: Log all participants and their tracks
        console.log('📞 All call participants:', videoCall.state.participants);
        console.log('📞 Call state:', videoCall.state.callingState);
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
    <div className="fixed inset-0 z-50 bg-black">
      {/* Global CSS override for full-width video */}
      <style jsx global>{`
        .str-video__call-layout,
        .str-video__speaker-layout,
        .str-video__participant-list,
        .str-video__call-layout > *,
        .str-video__speaker-layout > * {
          max-width: 100% !important;
          width: 100% !important;
        }
      `}</style>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg"
        title="End call"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Video call container - full screen */}
      <div className="w-full h-full bg-gray-900">
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
              <p className="text-white text-lg">Connecting...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
