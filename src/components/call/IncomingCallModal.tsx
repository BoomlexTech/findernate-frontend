'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Phone, PhoneOff, Video, Mic } from 'lucide-react';
import Image from 'next/image';

// Type definition for incoming call (moved from useAgora)
export interface IncomingCall {
  callId: string;
  callType: 'voice' | 'video';
  caller: {
    _id: string;
    username: string;
    fullName: string;
    profileImageUrl?: string;
  };
  timestamp: number;
}

interface IncomingCallModalProps {
  incomingCall: IncomingCall;
  onAccept: () => void;
  onDecline: () => void;
  isLoading?: boolean;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  incomingCall,
  onAccept,
  onDecline,
  isLoading = false
}) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  const onDeclineRef = useRef(onDecline);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep ref updated
  useEffect(() => {
    onDeclineRef.current = onDecline;
  }, [onDecline]);

  // Auto-decline after 30 seconds ONLY if user hasn't accepted/declined AND page is visible
  // This effect runs ONLY ONCE when modal mounts
  useEffect(() => {
    console.log('🔔 Incoming call modal mounted, setting 30-second auto-decline timer');

    timerRef.current = setTimeout(() => {
      // Only auto-decline if page is visible and user hasn't interacted
      const isPageVisible = !document.hidden;
      if (!hasInteracted && isPageVisible) {
        console.log('⏰ Auto-declining call after 30 seconds of no response');
        onDeclineRef.current();
      } else if (!isPageVisible) {
        console.log('⚠️ Page is hidden, not auto-declining (user may have switched tabs)');
      } else if (hasInteracted) {
        console.log('⚠️ User already interacted, not auto-declining');
      }
    }, 90000);

    return () => {
      if (timerRef.current) {
        console.log('🧹 Clearing auto-decline timer (modal unmounted or user interacted)');
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [incomingCall.callId]); // Only re-run if we get a NEW call (different callId)

  const isVideoCall = incomingCall.callType === 'video';

  return (
    <div 
      className="
        fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm
        animate-in fade-in duration-150
      "
    >
      <div 
        className="
          bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden
          animate-in zoom-in-95 slide-in-from-bottom-4 duration-150
        "
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-6 py-8 text-center text-white">
          <div className="flex items-center justify-center mb-4">
            {isVideoCall ? (
              <Video className="w-8 h-8 text-white/90" />
            ) : (
              <Phone className="w-8 h-8 text-white/90" />
            )}
          </div>
          
          <h2 className="text-lg font-medium mb-1">
            Incoming {isVideoCall ? 'video' : 'voice'} call
          </h2>
          
          <p className="text-white/80 text-sm">
            {new Date(incomingCall.timestamp).toLocaleTimeString()}
          </p>
        </div>

        {/* Caller Info */}
        <div className="px-6 py-8 text-center">
          <div className="mb-6">
            {incomingCall.caller.profileImageUrl ? (
              <Image
                src={incomingCall.caller.profileImageUrl}
                alt={incomingCall.caller.fullName}
                width={120}
                height={120}
                className="w-30 h-30 rounded-full object-cover mx-auto shadow-lg border-4 border-gray-100"
              />
            ) : (
              <div className="w-30 h-30 bg-gray-200 rounded-full mx-auto flex items-center justify-center shadow-lg">
                <span className="text-4xl">👤</span>
              </div>
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {incomingCall.caller.fullName}
          </h3>
          
          <p className="text-gray-600 mb-6">
            @{incomingCall.caller.username}
          </p>

          {/* Call Type Info */}
          <div className="flex items-center justify-center gap-2 mb-8 text-sm text-gray-500">
            {isVideoCall ? (
              <>
                <Video className="w-4 h-4" />
                <span>Video call with audio</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Voice call</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-8">
          <div className="flex gap-4 justify-center">
            {/* Decline Button */}
            <button
              onClick={() => {
                console.log('📞 User clicked Decline button');
                setHasInteracted(true);
                // Clear timer immediately when user declines
                if (timerRef.current) {
                  clearTimeout(timerRef.current);
                  timerRef.current = null;
                }
                onDecline();
              }}
              disabled={isLoading}
              className="
                w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full
                flex items-center justify-center transition-all duration-200
                hover:scale-105 active:scale-95 shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              "
              title="Decline call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            {/* Accept Button */}
            <button
              onClick={() => {
                console.log('📞 User clicked Accept button');
                setHasInteracted(true);
                // Clear timer immediately when user accepts
                if (timerRef.current) {
                  clearTimeout(timerRef.current);
                  timerRef.current = null;
                }
                onAccept();
              }}
              disabled={isLoading}
              className="
                w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full
                flex items-center justify-center transition-all duration-200
                hover:scale-105 active:scale-95 shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              "
              title={`Accept ${isVideoCall ? 'video' : 'voice'} call`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Phone className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <p className="text-center text-gray-500 text-sm mt-4">
              Starting {isVideoCall ? 'video' : 'voice'} call...
            </p>
          )}

          {/* Hint Text */}
          {!isLoading && (
            <p className="text-center text-gray-400 text-xs mt-4">
              Call will automatically decline in 30 seconds
            </p>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated rings around the modal */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-96 border-2 border-white/10 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute w-80 h-80 border-2 border-white/10 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          <div className="absolute w-64 h-64 border-2 border-white/10 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
        </div>
      </div>
    </div>
  );
};