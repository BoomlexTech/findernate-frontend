import { HMSReactiveStore } from '@100mslive/hms-video-store';
import { callAPI } from '@/api/call';

export interface HMSConfig {
  userName: string;
  authToken: string;
}

export interface HMSMediaSettings {
  audio: boolean;
  video: boolean;
}

class HMSService {
  private hms: HMSReactiveStore;
  private actions: any;
  private store: any;
  private isInitialized = false;

  constructor() {
    this.hms = new HMSReactiveStore();
    this.actions = this.hms.getActions();
    this.store = this.hms.getStore();
  }

  /**
   * Initialize HMS SDK
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🏠 Initializing HMS SDK...');
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Error initializing HMS SDK:', error);
      throw error;
    }
  }

  /**
   * Join HMS room with authentication token
   */
  async joinRoom(callId: string, config: HMSConfig, mediaSettings: HMSMediaSettings = { audio: true, video: true }): Promise<void> {
    try {
      await this.initialize();

      console.log('🚪 Joining HMS room for call:', callId);
      console.log('🔑 HMS Config:', {
        userName: config.userName,
        authTokenLength: config.authToken?.length,
        authTokenPreview: config.authToken?.substring(0, 50) + '...',
        mediaSettings
      });

      // Decode the JWT token to check its contents
      try {
        const payload = JSON.parse(atob(config.authToken.split('.')[1]));
        console.log('🔍 JWT Token payload:', payload);
        console.log('🏠 Room ID in token:', payload.room_id);
        console.log('👤 User ID in token:', payload.user_id);
        console.log('🎭 Role in token:', payload.role);
      } catch (decodeError) {
        console.error('❌ Failed to decode JWT token:', decodeError);
      }

      // Join the room
      await this.actions.join({
        userName: config.userName,
        authToken: config.authToken,
        settings: {
          isAudioMuted: !mediaSettings.audio,
          isVideoMuted: !mediaSettings.video
        }
      });

      console.log('✅ Successfully joined HMS room');
    } catch (error) {
      console.error('❌ Error joining HMS room:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        description: error.description
      });
      throw error;
    }
  }

  /**
   * Leave HMS room
   */
  async leaveRoom(): Promise<void> {
    try {
      console.log('🚪 Leaving HMS room...');
      await this.actions.leave();
      console.log('✅ Successfully left HMS room');
    } catch (error) {
      console.error('❌ Error leaving HMS room:', error);
      throw error;
    }
  }

  /**
   * Toggle local audio
   */
  async toggleAudio(enabled: boolean): Promise<void> {
    try {
      await this.actions.setLocalAudioEnabled(enabled);
      console.log(`🎤 Audio ${enabled ? 'enabled' : 'muted'}`);
    } catch (error) {
      console.error('❌ Error toggling audio:', error);
      throw error;
    }
  }

  /**
   * Toggle local video
   */
  async toggleVideo(enabled: boolean): Promise<void> {
    try {
      await this.actions.setLocalVideoEnabled(enabled);
      console.log(`📹 Video ${enabled ? 'enabled' : 'muted'}`);
    } catch (error) {
      console.error('❌ Error toggling video:', error);
      throw error;
    }
  }

  /**
   * Get local peer
   */
  getLocalPeer() {
    return this.store.getState().peers.localPeer;
  }

  /**
   * Get all remote peers
   */
  getRemotePeers() {
    return this.store.getState().peers.remotePeers;
  }

  /**
   * Get all peers
   */
  getAllPeers() {
    return this.store.getState().peers.peers;
  }

  /**
   * Subscribe to HMS store updates
   */
  subscribe(selector: any, callback: (state: any) => void) {
    return this.store.subscribe(callback, selector);
  }

  /**
   * Get HMS actions
   */
  getActions() {
    return this.actions;
  }

  /**
   * Get HMS store
   */
  getStore() {
    return this.store;
  }

  /**
   * Get room state
   */
  getRoomState() {
    return this.store.getState().room;
  }

  /**
   * Get connection state
   */
  getConnectionState() {
    return this.store.getState().room.roomState;
  }

  /**
   * Check if joined to room
   */
  isJoined(): boolean {
    const roomState = this.getRoomState().roomState;
    return roomState === 'Connected';
  }

  /**
   * Get error state
   */
  getError() {
    return this.store.getState().errors;
  }

  /**
   * Clean up HMS resources
   */
  cleanup(): void {
    try {
      console.log('🧹 Cleaning up HMS resources...');
      // Additional cleanup if needed
    } catch (error) {
      console.error('❌ Error during HMS cleanup:', error);
    }
  }
}

// Create singleton instance
export const hmsService = new HMSService();

/**
 * Helper function to get HMS auth token from backend
 */
export const getHMSToken = async (callId: string, role: 'host' | 'guest' = 'guest') => {
  try {
    const tokenData = await callAPI.getHMSAuthToken(callId, role);
    return tokenData;
  } catch (error) {
    console.error('❌ Error fetching HMS token:', error);
    throw error;
  }
};

/**
 * Helper function to get HMS room details from backend
 */
export const getHMSRoomDetails = async (callId: string) => {
  try {
    const roomDetails = await callAPI.getHMSRoomDetails(callId);
    return roomDetails;
  } catch (error) {
    console.error('❌ Error fetching HMS room details:', error);
    throw error;
  }
};

export default hmsService;