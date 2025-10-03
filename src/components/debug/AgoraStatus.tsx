'use client';

import React from 'react';
import { useAgoraGlobalCall } from '@/components/providers/AgoraGlobalCallProvider';

export const AgoraStatus: React.FC = () => {
  const { isSDKReady, callState, isLoading } = useAgoraGlobalCall();

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50 max-w-xs">
      <h3 className="font-semibold text-lg mb-2">Agora Status</h3>
      <div className="space-y-1 text-sm">
        <div className={`flex items-center gap-2`}>
          <div className={`w-3 h-3 rounded-full ${isSDKReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>SDK Ready: {isSDKReady ? 'Yes' : 'No'}</span>
        </div>
        <div className={`flex items-center gap-2`}>
          <div className={`w-3 h-3 rounded-full ${callState.isInCall ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span>In Call: {callState.isInCall ? 'Yes' : 'No'}</span>
        </div>
        <div className={`flex items-center gap-2`}>
          <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
          <span>Loading: {isLoading ? 'Yes' : 'No'}</span>
        </div>
        {callState.connectionState && (
          <div className="text-xs text-gray-600">
            Connection: {callState.connectionState}
          </div>
        )}
        {callState.error && (
          <div className="text-xs text-red-600">
            Error: {callState.error}
          </div>
        )}
      </div>
    </div>
  );
};
