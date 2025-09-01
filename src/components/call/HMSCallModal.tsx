'use client';

import React, { useEffect } from 'react';
import { 
  selectLocalPeer, 
  selectRemotePeers, 
  selectRoomState,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled
} from '@100mslive/hms-video-store';
// Note: Video component might not be available, using direct peer track rendering instead
import { HMSVideoRenderer } from './HMSVideoRenderer';
import { hmsService } from '@/utils/hms';
import { CallState } from '@/providers/HMSCallProvider';
import { CallControls } from './CallControls';
import { CallStatus } from './CallStatus';
import { X, Minimize2 } from 'lucide-react';
import Image from 'next/image';

interface HMSCallModalProps {
  callState: any; // HMS call state
  incomingCall?: any | null;
  isLoading?: boolean;
  currentUser?: any;
  onEndCall: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
}

export const HMSCallModal: React.FC<HMSCallModalProps> = ({
  callState,
  incomingCall,
  isLoading = false,
  currentUser,
  onEndCall,
  onToggleAudio,
  onToggleVideo,
  onMinimize,
  isMinimized = false
}) => {
  const [localPeer, setLocalPeer] = React.useState<any>(null);
  const [remotePeers, setRemotePeers] = React.useState<any[]>([]);
  const [roomState, setRoomState] = React.useState<string>('');
  const [isLocalAudioEnabled, setIsLocalAudioEnabled] = React.useState(true);
  const [isLocalVideoEnabled, setIsLocalVideoEnabled] = React.useState(true);

  // Subscribe to HMS store updates
  useEffect(() => {
    const unsubscribeLocalPeer = hmsService.subscribe(selectLocalPeer, setLocalPeer);
    const unsubscribeRemotePeers = hmsService.subscribe(selectRemotePeers, setRemotePeers);
    const unsubscribeRoomState = hmsService.subscribe(selectRoomState, setRoomState);
    const unsubscribeLocalAudio = hmsService.subscribe(selectIsLocalAudioEnabled, setIsLocalAudioEnabled);
    const unsubscribeLocalVideo = hmsService.subscribe(selectIsLocalVideoEnabled, setIsLocalVideoEnabled);

    return () => {
      unsubscribeLocalPeer();
      unsubscribeRemotePeers();
      unsubscribeRoomState();
      unsubscribeLocalAudio();
      unsubscribeLocalVideo();
    };
  }, []);

  // Don't render if no call is active
  if (!callState.isInCall && !incomingCall) return null;

  const isVideoCall = callState.currentCall?.callType === 'video' || incomingCall?.callType === 'video';
  const isConnected = roomState === 'Connected';
  
  // Map HMS room state to WebRTC connection state for CallStatus component
  const mapRoomStateToConnection = (state: string): RTCPeerConnectionState | null => {
    switch (state) {
      case 'Connected':
        return 'connected';
      case 'Connecting':
        return 'connecting';
      case 'Failed':
        return 'failed';
      case 'Disconnected':
        return 'disconnected';
      default:
        return null;
    }
  };
  
  // Get the other participant (not the current user)
  const otherParticipant = callState.currentCall?.participants.find(
    (p: any) => p._id !== currentUser?._id
  ) || incomingCall?.caller;

  // Get the main remote peer (first one)
  const mainRemotePeer = remotePeers?.[0];

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-gray-900 text-white rounded-lg p-4 shadow-2xl max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {otherParticipant?.profileImageUrl && (
                <Image
                  src={otherParticipant.profileImageUrl}
                  alt={otherParticipant.fullName}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-sm font-medium">{otherParticipant?.fullName}</p>
                <CallStatus 
                  status={callState.currentCall?.status} 
                  duration={callState.callDuration}
                  connectionState={mapRoomStateToConnection(roomState)}
                  quality="good"
                />
              </div>
            </div>
            <button
              onClick={onMinimize}
              className="text-gray-400 hover:text-white"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
          
          <CallControls
            isAudioEnabled={callState.isAudioEnabled}
            isVideoEnabled={callState.isVideoEnabled}
            onToggleAudio={onToggleAudio}
            onToggleVideo={onToggleVideo}
            onEndCall={onEndCall}
            callType={callState.currentCall?.callType || 'voice'}
            size="small"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-6 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center gap-3">
            {otherParticipant?.profileImageUrl && (
              <Image
                src={otherParticipant.profileImageUrl}
                alt={otherParticipant.fullName}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
              />
            )}
            <div className="text-white">
              <h2 className="text-xl font-semibold">{otherParticipant?.fullName}</h2>
              <p className="text-sm text-white/80">@{otherParticipant?.username}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onMinimize && (
              <button
                onClick={onMinimize}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onEndCall}
              className="p-2 text-white/80 hover:text-white hover:bg-red-600/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className="flex-1 relative">
          {isVideoCall ? (
            <>
              {/* Remote Video (Main) */}
              {mainRemotePeer?.videoTrack ? (
                <div className="w-full h-full relative">
                  <HMSVideoRenderer
                    track={mainRemotePeer.videoTrack}
                    className="w-full h-full object-cover bg-gray-900"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    {otherParticipant?.profileImageUrl ? (
                      <div className="mb-4">
                        <Image
                          src={otherParticipant.profileImageUrl}
                          alt={otherParticipant.fullName}
                          width={120}
                          height={120}
                          className="w-30 h-30 rounded-full object-cover mx-auto shadow-xl border-2 border-white/20"
                        />
                      </div>
                    ) : (
                      <div className="w-30 h-30 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl">
                        <span className="text-4xl">👤</span>
                      </div>
                    )}
                    <p className="text-lg text-white/80">Camera is off</p>
                  </div>
                </div>
              )}
              
              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute top-20 right-6 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-xl border-2 border-white/20">
                {localPeer?.videoTrack && isLocalVideoEnabled ? (
                  <HMSVideoRenderer
                    track={localPeer.videoTrack}
                    className="w-full h-full object-cover"
                    mirror={true}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📹</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Debug info for HMS streams */}
              {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-20 left-6 bg-black/70 text-white p-2 rounded text-xs">
                  <div>Room State: {roomState}</div>
                  <div>Local Peer: {localPeer?.name || 'None'}</div>
                  <div>Remote Peers: {remotePeers.length}</div>
                  <div>Local Audio: {isLocalAudioEnabled ? '✅' : '❌'}</div>
                  <div>Local Video: {isLocalVideoEnabled ? '✅' : '❌'}</div>
                  <div>Remote Video Track: {mainRemotePeer?.videoTrack ? '✅' : '❌'}</div>
                  <div>Remote Audio Track: {mainRemotePeer?.audioTrack ? '✅' : '❌'}</div>
                </div>
              )}
            </>
          ) : (
            /* Audio Call or Connecting State */
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <div className="text-center text-white">
                {otherParticipant?.profileImageUrl ? (
                  <div className="mb-6">
                    <Image
                      src={otherParticipant.profileImageUrl}
                      alt={otherParticipant.fullName}
                      width={200}
                      height={200}
                      className="w-48 h-48 rounded-full object-cover mx-auto shadow-2xl border-4 border-white/20"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
                    <span className="text-6xl">👤</span>
                  </div>
                )}
                
                <h2 className="text-3xl font-bold mb-2">{otherParticipant?.fullName}</h2>
                <p className="text-xl text-white/80 mb-6">@{otherParticipant?.username}</p>
              </div>
            </div>
          )}
        </div>

        {/* Status and Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex flex-col items-center gap-4">
            {/* Call Status */}
            <div className="text-center text-white">
              <CallStatus 
                status={callState.currentCall?.status} 
                duration={callState.callDuration}
                connectionState={mapRoomStateToConnection(roomState)}
                quality="good"
              />
              
              {callState.error && (
                <p className="text-red-400 text-sm mt-2">{callState.error}</p>
              )}
              
              {isLoading && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm">Connecting...</span>
                </div>
              )}
            </div>

            {/* Call Controls */}
            <CallControls
              isAudioEnabled={callState.isAudioEnabled}
              isVideoEnabled={callState.isVideoEnabled}
              onToggleAudio={onToggleAudio}
              onToggleVideo={onToggleVideo}
              onEndCall={onEndCall}
              callType={callState.currentCall?.callType || incomingCall?.callType || 'voice'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};