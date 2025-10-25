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
      // Cleanup on unmount or when modal closes
      if (call) {
        call.leave().catch(console.error);
      }
      if (client) {
        client.disconnectUser().catch(console.error);
      }
    };
  }, [isOpen, apiKey, token, userId, userName, userImage, callId, callType]);

  const handleClose = async () => {
    try {
      if (call) {
        await call.leave();
      }
      if (client) {
        await client.disconnectUser();
      }
      onClose();
    } catch (error) {
      console.error('Error closing call:', error);
      onClose();
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
