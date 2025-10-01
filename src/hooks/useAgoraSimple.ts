import { useState, useCallback } from 'react';
import { callAPI, Call } from '@/api/call';
import { useUserStore } from '@/store/useUserStore';

// Simplified Agora hook for testing build issues
export const useAgoraSimple = () => {
  const user = useUserStore((state) => state.user);
  
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize SDK (simplified)
  const initializeSDK = useCallback(async () => {
    if (typeof window === 'undefined') return false;
    
    try {
      // Dynamic import to avoid SSR issues
      const agoraModule = await import('agora-rtc-sdk-ng');
      console.log('✅ Agora SDK loaded successfully');
      setIsSDKReady(true);
      return true;
    } catch (error) {
      console.error('❌ Failed to load Agora SDK:', error);
      setError('Failed to load Agora SDK');
      return false;
    }
  }, []);

  // Test API call
  const testAPICall = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Test a simple API call
      const activeCall = await callAPI.getActiveCall();
      console.log('✅ API call successful:', activeCall);
      
      return activeCall;
    } catch (error: any) {
      console.error('❌ API call failed:', error);
      setError(error.message || 'API call failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isSDKReady,
    isLoading,
    error,
    initializeSDK,
    testAPICall,
  };
};
