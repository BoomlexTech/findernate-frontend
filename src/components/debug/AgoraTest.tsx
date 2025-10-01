'use client';

import React, { useState } from 'react';
import { useAgoraGlobalCall } from '@/components/providers/AgoraGlobalCallProvider';

export const AgoraTest: React.FC = () => {
  const [receiverId, setReceiverId] = useState('');
  const [chatId, setChatId] = useState('');
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  
  const { 
    callState, 
    incomingCall, 
    isLoading, 
    initiateCall, 
    endCall,
    cleanupExistingCalls 
  } = useAgoraGlobalCall();

  const handleInitiateCall = async () => {
    if (!receiverId || !chatId) {
      alert('Please enter receiver ID and chat ID');
      return;
    }
    
    try {
      await initiateCall(receiverId, chatId, callType);
      console.log('Call initiated successfully');
    } catch (error) {
      console.error('Failed to initiate call:', error);
      alert('Failed to initiate call');
    }
  };

  const handleEndCall = async () => {
    try {
      await endCall();
      console.log('Call ended successfully');
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const handleCleanup = async () => {
    try {
      await cleanupExistingCalls();
      console.log('Call cleanup completed successfully');
      alert('Call cleanup completed!');
    } catch (error) {
      console.error('Failed to cleanup calls:', error);
      alert('Failed to cleanup calls');
    }
  };


  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-md">
      <h3 className="text-lg font-semibold mb-4">Agora Call Test</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Receiver ID:</label>
          <input
            type="text"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter receiver user ID"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Chat ID:</label>
          <input
            type="text"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter chat ID"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Call Type:</label>
          <select
            value={callType}
            onChange={(e) => setCallType(e.target.value as 'voice' | 'video')}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="voice">Voice Call</option>
            <option value="video">Video Call</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleInitiateCall}
              disabled={isLoading || callState.isInCall}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Initiating...' : 'Start Call'}
            </button>
            
            <button
              onClick={handleEndCall}
              disabled={!callState.isInCall}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
            >
              End Call
            </button>
          </div>
          
          <button
            onClick={handleCleanup}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            Cleanup Existing Calls
          </button>
        </div>
      </div>
      
      {/* Status Display */}
      <div className="mt-4 p-3 bg-gray-100 rounded-md">
        <h4 className="font-medium mb-2">Status:</h4>
        <div className="text-sm space-y-1">
          <div>Call State: {callState.isInCall ? 'In Call' : 'Not in Call'}</div>
          <div>Connection: {callState.connectionState || 'None'}</div>
          <div>Audio: {callState.isAudioEnabled ? 'Enabled' : 'Disabled'}</div>
          <div>Video: {callState.isVideoEnabled ? 'Enabled' : 'Disabled'}</div>
          {callState.error && (
            <div className="text-red-600">Error: {callState.error}</div>
          )}
          {incomingCall && (
            <div className="text-blue-600">Incoming call from: {incomingCall.caller.fullName}</div>
          )}
        </div>
      </div>
    </div>
  );
};
