'use client';

import React, { useEffect, useRef } from 'react';

interface HMSVideoRendererProps {
  track: any; // HMS video track
  className?: string;
  mirror?: boolean;
}

export const HMSVideoRenderer: React.FC<HMSVideoRendererProps> = ({ 
  track, 
  className = '', 
  mirror = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && track) {
      // Attach the track to the video element
      if (track.track) {
        videoElement.srcObject = new MediaStream([track.track]);
      }
    }

    return () => {
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [track]);

  if (!track) {
    return null;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      muted={mirror} // Mute local video to avoid echo
      playsInline
      className={`${className} ${mirror ? 'scale-x-[-1]' : ''}`}
    />
  );
};