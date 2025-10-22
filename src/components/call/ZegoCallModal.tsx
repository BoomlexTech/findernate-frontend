'use client';

import React, { useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Maximize, Minimize } from 'lucide-react';
import { useZegoGlobalCall } from '@/components/providers/ZegoCallProvider';

export const ZegoCallModal: React.FC = () => {
  const {
    isInCall,
    localStream,
    remoteStream,
    isMuted,
    isVideoEnabled,
    toggleMute,
    toggleVideo,
    endCurrentCall,
    connectionQuality,
    callDuration,
    currentCallType
  } = useZegoGlobalCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(console.error);
    }
  }, [localStream]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(console.error);
    }
  }, [remoteStream]);

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Connection quality indicator
  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isInCall) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[9999] bg-gray-900 flex flex-col
        ${isFullscreen ? '' : 'inset-4 rounded-2xl shadow-2xl'}
      `}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          {/* Call Info */}
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${getQualityColor()} animate-pulse`} />
            <div>
              <p className="text-sm font-medium">
                {currentCallType === 'video' ? 'Video Call' : 'Voice Call'}
              </p>
              <p className="text-xs text-gray-300">{formatDuration(callDuration)}</p>
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Remote Video (Main) */}
        {currentCallType === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-white">
                <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Video size={48} className="text-gray-400" />
                </div>
                <p className="text-lg">Waiting for video...</p>
              </div>
            )}
          </div>
        )}

        {/* Voice Call Display */}
        {currentCallType === 'voice' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
            <div className="text-center text-white">
              <div className="w-32 h-32 bg-white/10 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                <Phone size={48} />
              </div>
              <p className="text-2xl font-semibold mb-2">Voice Call Active</p>
              <p className="text-lg opacity-80">{formatDuration(callDuration)}</p>
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        {currentCallType === 'video' && localStream && (
          <div className="absolute top-20 right-4 w-40 h-32 bg-gray-700 rounded-lg overflow-hidden shadow-lg border-2 border-white/20">
            {isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <VideoOff size={32} className="text-gray-400" />
              </div>
            )}
          </div>
        )}

        {/* Connection Quality Indicator */}
        <div className="absolute top-20 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-white text-sm">
            <div className={`w-2 h-2 rounded-full ${getQualityColor()}`} />
            <span className="capitalize">{connectionQuality}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`
              w-14 h-14 rounded-full flex items-center justify-center transition-all
              ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}
            `}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <MicOff size={24} className="text-white" />
            ) : (
              <Mic size={24} className="text-white" />
            )}
          </button>

          {/* Video Toggle (only for video calls) */}
          {currentCallType === 'video' && (
            <button
              onClick={toggleVideo}
              className={`
                w-14 h-14 rounded-full flex items-center justify-center transition-all
                ${!isVideoEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}
              `}
              title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
            >
              {isVideoEnabled ? (
                <Video size={24} className="text-white" />
              ) : (
                <VideoOff size={24} className="text-white" />
              )}
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={endCurrentCall}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg"
            title="End call"
          >
            <PhoneOff size={28} className="text-white" />
          </button>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};
