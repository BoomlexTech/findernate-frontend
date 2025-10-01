'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAgora } from '@/hooks/useAgora';
import { IncomingCallModal } from '@/components/call/IncomingCallModal';
import { AgoraCallModal } from '@/components/call/AgoraCallModal';
import { useUserStore } from '@/store/useUserStore';

interface AgoraGlobalCallContextType {
  // State
  callState: import('@/hooks/useAgora').AgoraCallState;
  incomingCall: import('@/hooks/useAgora').IncomingCall | null;
  isLoading: boolean;
  isSDKReady: boolean;
  
  // Actions
  initiateCall: (receiverId: string, chatId: string, callType: 'voice' | 'video') => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  endCall: (endReason?: string) => Promise<void>;
  toggleAudio: () => void;
  toggleVideo: () => void;
  
  // Helpers
  getConnectionQuality: () => 'excellent' | 'good' | 'poor' | 'failed' | null;
  cleanupExistingCalls: () => Promise<boolean>;
  
  // Direct access to streams
  localVideoTrack: import('agora-rtc-sdk-ng').ICameraVideoTrack | null;
  localAudioTrack: import('agora-rtc-sdk-ng').IMicrophoneAudioTrack | null;
  remoteUsers: import('agora-rtc-sdk-ng').IAgoraRTCRemoteUser[];
}

const AgoraGlobalCallContext = createContext<AgoraGlobalCallContextType | null>(null);

export const useAgoraGlobalCall = () => {
  const context = useContext(AgoraGlobalCallContext);
  if (!context) {
    throw new Error('useAgoraGlobalCall must be used within an AgoraGlobalCallProvider');
  }
  return context;
};

export const AgoraGlobalCallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useUserStore((state) => state.user);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const {
    callState,
    incomingCall,
    isLoading,
    isSDKReady,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo,
    getConnectionQuality,
    cleanupExistingCalls,
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
  } = useAgora();

  const handleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  const contextValue: AgoraGlobalCallContextType = {
    // State
    callState,
    incomingCall,
    isLoading,
    isSDKReady,
    
    // Actions
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo,
    
    // Helpers
    getConnectionQuality,
    cleanupExistingCalls,
    
    // Direct access to streams
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
  };

  return (
    <AgoraGlobalCallContext.Provider value={contextValue}>
      {children}
      
      {/* Global incoming call modal */}
      {incomingCall && (
        <IncomingCallModal
          incomingCall={incomingCall}
          onAccept={acceptCall}
          onDecline={declineCall}
        />
      )}
      
      {/* Global call modal */}
      {(callState.isInCall || incomingCall) && (
        <AgoraCallModal
          callState={callState}
          incomingCall={incomingCall}
          isLoading={isLoading}
          currentUser={user}
          onEndCall={() => endCall()}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onMinimize={handleMinimize}
          isMinimized={isMinimized}
          remoteUsers={remoteUsers}
          localVideoTrack={localVideoTrack}
          localAudioTrack={localAudioTrack}
        />
      )}
    </AgoraGlobalCallContext.Provider>
  );
};
