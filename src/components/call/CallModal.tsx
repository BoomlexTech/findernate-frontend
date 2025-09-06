'use client';

import React, { useEffect, useRef } from 'react';
import { CallState, IncomingCall } from '@/hooks/useWebRTC';
import { CallControls } from './CallControls';
import { CallStatus } from './CallStatus';
import { X, Minimize2 } from 'lucide-react';
import Image from 'next/image';

interface CallModalProps {
  callState: CallState;
  incomingCall?: IncomingCall | null;
  isLoading?: boolean;
  currentUser?: any;
  onEndCall: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
}

export const CallModal: React.FC<CallModalProps> = ({
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
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Setup video streams
  useEffect(() => {
    if (localVideoRef.current && callState.localStream) {
      //console.log('🎥 Setting local video stream:', callState.localStream);
      localVideoRef.current.srcObject = callState.localStream;
      
      // Ensure video plays
      localVideoRef.current.play().catch(error => {
        console.error('❌ Error playing local video:', error);
      });
    }
  }, [callState.localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && callState.remoteStream) {
      //console.log('🎥 Setting remote video stream:', callState.remoteStream);
      //console.log('🎥 Remote stream tracks:', callState.remoteStream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
      
      remoteVideoRef.current.srcObject = callState.remoteStream;
      
      // Ensure video plays and audio is enabled
      remoteVideoRef.current.muted = false; // Make sure audio is not muted
      remoteVideoRef.current.volume = 1.0; // Set volume to maximum
      
      remoteVideoRef.current.play().catch(error => {
        console.error('❌ Error playing remote video:', error);
      });
    }
  }, [callState.remoteStream]);

  // Setup audio element for audio-only calls or as backup
  useEffect(() => {
    if (remoteAudioRef.current && callState.remoteStream) {
      //console.log('🔊 Setting remote audio stream:', callState.remoteStream);
      remoteAudioRef.current.srcObject = callState.remoteStream;
      remoteAudioRef.current.volume = 1.0;
      
      remoteAudioRef.current.play().catch(error => {
        console.error('❌ Error playing remote audio:', error);
      });
    }
  }, [callState.remoteStream]);

  // Don't render if no call is active
  if (!callState.isInCall && !incomingCall) return null;

  const isVideoCall = callState.call?.callType === 'video' || incomingCall?.callType === 'video';
  const isConnected = callState.connectionState === 'connected';
  
  // Get the other participant (not the current user)
  const otherParticipant = callState.call?.participants.find(
    p => p._id !== currentUser?._id
  ) || incomingCall?.caller;

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
                  status={callState.call?.status} 
                  duration={callState.call?.duration || 0}
                  connectionState={callState.connectionState}
                  quality={callState.callStats?.quality}
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
            callType={callState.call?.callType || 'voice'}
            size="small"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      {/* Hidden audio element for remote audio playback */}
      <audio ref={remoteAudioRef} autoPlay />
      
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
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={false}
                className="w-full h-full object-cover bg-gray-900"
              />
              
              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute top-20 right-6 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-xl border-2 border-white/20">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!callState.isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📹</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Debug info for video streams */}
              {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-20 left-6 bg-black/70 text-white p-2 rounded text-xs">
                  <div>Local Stream: {callState.localStream ? '✅' : '❌'}</div>
                  <div>Remote Stream: {callState.remoteStream ? '✅' : '❌'}</div>
                  <div>Connection: {callState.connectionState || 'none'}</div>
                  <div>Video Enabled: {callState.isVideoEnabled ? '✅' : '❌'}</div>
                  {callState.localStream && (
                    <div>Local Tracks: {callState.localStream.getTracks().map(t => t.kind).join(', ')}</div>
                  )}
                  {callState.remoteStream && (
                    <div>Remote Tracks: {callState.remoteStream.getTracks().map(t => t.kind).join(', ')}</div>
                  )}
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
                status={callState.call?.status} 
                duration={callState.call?.duration || 0}
                connectionState={callState.connectionState}
                quality={callState.callStats?.quality}
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
              callType={callState.call?.callType || incomingCall?.callType || 'voice'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};