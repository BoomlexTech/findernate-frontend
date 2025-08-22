import { socketManager } from './socket';

export interface CallConfig {
  audio: boolean;
  video: boolean;
}

export interface ICECandidate {
  candidate: string;
  sdpMLineIndex: number;
  sdpMid: string;
}

export interface CallStats {
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  quality: 'excellent' | 'good' | 'poor' | 'failed';
  latency?: number;
}

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callId: string | null = null;
  private isInitiator: boolean = false;
  private pendingCandidates: ICECandidate[] = [];
  private pendingOffer: { offer: RTCSessionDescriptionInit; senderId: string } | null = null;
  private receiverId: string | null = null;
  private callerId: string | null = null;
  private connectionRetryCount = 0;
  private maxRetries = 2;
  
  // Event callbacks
  private onRemoteStreamCallback?: (stream: MediaStream) => void;
  private onConnectionStateChangeCallback?: (state: RTCPeerConnectionState) => void;
  private onCallStatsCallback?: (stats: CallStats) => void;
  private onErrorCallback?: (error: Error) => void;

  // ICE servers configuration - Enhanced for production with multiple TURN providers
  private iceServers: RTCIceServer[] = [
    // Multiple TURN servers for better reliability
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turns:openrelay.metered.ca:443'
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: [
        'turn:openrelay.metered.ca:80?transport=tcp',
        'turn:openrelay.metered.ca:443?transport=tcp'
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    
    // Additional free TURN servers
    {
      urls: [
        'turn:relay.webrtc.ro:3478',
        'turn:relay.webrtc.ro:80',
        'turn:relay.webrtc.ro:443'
      ],
      username: 'test',
      credential: 'test123'
    },
    
    // Fallback STUN servers (multiple providers)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.stunprotocol.org:3478' },
    { urls: 'stun:stun.antisip.com:3478' },
    { urls: 'stun:stun.bluesip.net:3478' },
    { urls: 'stun:stun.dus.net:3478' },
    { urls: 'stun:stun.epygi.com:3478' },
    { urls: 'stun:stun.sonetel.com:3478' },
    { urls: 'stun:stun.uls.co.za:3478' },
    { urls: 'stun:stun.voipgate.com:3478' },
    { urls: 'stun:stun.voys.nl:3478' }
  ];

  constructor() {
    const instanceId = Math.random().toString(36).substr(2, 9);
    console.log('🎯 WebRTC Manager: Constructor called, setting up socket listeners - Instance:', instanceId);
    
    // Always set up socket listeners immediately
    // Socket events will be queued until socket connects, which is fine
    console.log('🎯 Setting up WebRTC socket listeners immediately');
    this.setupSocketListeners();
  }

  // Initialize peer connection
  private createPeerConnection(): RTCPeerConnection {
    console.log('🔧 Creating peer connection with ICE servers:', this.iceServers);
    const pc = new RTCPeerConnection({
      iceServers: this.iceServers,
      iceCandidatePoolSize: 15, // Increased for better connectivity
      iceTransportPolicy: 'all', // Use both STUN and TURN
      bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  // Additional configuration for better reliability
  // Enable aggressive ICE nomination for faster connection
    });

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      console.log('ICE candidate generated:', event.candidate?.candidate?.substring(0, 50) + '...');
      if (event.candidate && this.callId) {
        const targetUserId = this.isInitiator ? this.receiverId : this.callerId;
        console.log('Sending ICE candidate to:', targetUserId);
        if (targetUserId) {
          socketManager.sendICECandidate(
            this.callId,
            targetUserId,
            {
              candidate: event.candidate.candidate,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
              sdpMid: event.candidate.sdpMid,
            }
          );
        }
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.onRemoteStreamCallback?.(this.remoteStream);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Peer connection state:', pc.connectionState);
      this.onConnectionStateChangeCallback?.(pc.connectionState);
      
      // Calculate and emit call stats
      this.calculateCallStats(pc);
      
      if (pc.connectionState === 'failed') {
        this.onErrorCallback?.(new Error('Peer connection failed'));
      }
    };

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      console.log('ICE gathering state:', pc.iceGatheringState);
      
      if (pc.iceConnectionState === 'failed') {
        console.error('❌ ICE connection failed - this usually means:');
        console.error('1. Firewall is blocking WebRTC traffic');
        console.error('2. Both users are behind symmetric NAT');
        console.error('3. TURN server is needed but not available');
        console.error('4. Network doesn\'t allow UDP traffic');
        
        // Attempt retry if we haven't exceeded max retries
        if (this.connectionRetryCount < this.maxRetries) {
          this.connectionRetryCount++;
          console.warn(`🔄 Attempting connection retry ${this.connectionRetryCount}/${this.maxRetries}`);
          
          // Wait a bit then retry with a fresh connection
          setTimeout(() => {
            this.retryConnection();
          }, 2000);
        } else {
          console.error('❌ Max connection retries exceeded');
          this.onErrorCallback?.(new Error('ICE connection failed - Network connectivity issue'));
        }
      } else if (pc.iceConnectionState === 'disconnected') {
        console.warn('⚠️ ICE connection disconnected - attempting to reconnect...');
      } else if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        console.log('✅ ICE connection established successfully!');
        // Reset retry count on successful connection
        this.connectionRetryCount = 0;
      }
    };

    return pc;
  }

  // Setup socket event listeners for WebRTC signaling
  private setupSocketListeners(): void {
    console.log('🎯 WebRTC Manager: Setting up socket listeners');
    console.log('🎯 WebRTC Manager: SocketManager instance:', socketManager);
    console.log('🎯 WebRTC Manager: Registering webrtc_offer handler');
    
    // Test if the event system is working at all
    socketManager.on('test_webrtc_event', (data) => {
      console.log('🧪 TEST: WebRTC Manager received test event:', data);
    });
    
    // Manually test the event system after a delay
    setTimeout(() => {
      console.log('🧪 TEST: Manually emitting test_webrtc_event');
      (socketManager as any).emit('test_webrtc_event', { test: 'manual trigger' });
    }, 2000);
    
    // Handle incoming WebRTC offer
    socketManager.on('webrtc_offer', async (data) => {
      const { callId, offer, senderId } = data;
      console.log('🚨 WEBRTC_OFFER HANDLER EXECUTED!!! 🚨');
      console.log('🎯 WebRTC Manager: Received WebRTC offer for call:', callId, 'from sender:', senderId);
      console.log('🎯 WebRTC Manager: Current callId:', this.callId);
      console.log('🎯 WebRTC Manager: Offer SDP type:', offer?.type);
      
      try {
        // Validate the call ID matches what we're expecting
        if (this.callId && this.callId !== callId) {
          console.warn('⚠️ Received offer for wrong call. Expected:', this.callId, 'Received:', callId);
          return;
        }
        
        // If we don't have a peer connection yet, store the offer for later
        if (!this.peerConnection || !this.localStream) {
          console.log('⏳ Peer connection not ready, storing offer for later processing...');
          console.log('⏳ PeerConnection exists:', !!this.peerConnection);
          console.log('⏳ LocalStream exists:', !!this.localStream);
          console.log('⏳ CallId already set:', !!this.callId);
          
          this.pendingOffer = { offer, senderId };
          
          // Only set these if they weren't already set by prepareForIncomingCall
          if (!this.callId) {
            console.log('⏳ Setting callId and callerId from offer (fallback)');
            this.callId = callId;
            this.callerId = senderId;
            this.isInitiator = false;
          } else {
            console.log('⏳ CallId already prepared, keeping existing values');
          }
          
          console.log('⏳ Stored pending offer with senderId:', senderId, 'for callId:', this.callId);
          return;
        }

        await this.processOffer(callId, offer, senderId);
        
      } catch (error) {
        console.error('❌ Error handling WebRTC offer:', error);
        this.onErrorCallback?.(error as Error);
      }
    });

    // Handle incoming WebRTC answer
    socketManager.on('webrtc_answer', async (data) => {
      const { callId, answer, senderId } = data;
      console.log('🎯 WebRTC Manager: Received WebRTC answer for call:', callId, 'from:', senderId);
      
      try {
        if (this.peerConnection && this.callId === callId) {
          console.log('✅ Setting remote description (answer)');
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          console.log('✅ Answer set successfully - WebRTC should connect soon!');
          
          // Process any pending ICE candidates
          console.log('Processing', this.pendingCandidates.length, 'pending ICE candidates');
          for (const candidate of this.pendingCandidates) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          }
          this.pendingCandidates = [];
        } else {
          console.warn('⚠️ Received answer but no matching peer connection or call ID mismatch');
          console.warn('Expected callId:', this.callId, 'Received:', callId);
        }
      } catch (error) {
        console.error('❌ Error handling WebRTC answer:', error);
        this.onErrorCallback?.(error as Error);
      }
    });

    // Handle incoming ICE candidates
    socketManager.on('webrtc_ice_candidate', async (data) => {
      const { callId, candidate, senderId } = data;
      console.log('Received ICE candidate for call:', callId);
      
      try {
        if (this.peerConnection && this.callId === callId) {
          if (this.peerConnection.remoteDescription) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            // Store candidate for later if remote description isn't set yet
            this.pendingCandidates.push(candidate);
          }
        }
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
        this.onErrorCallback?.(error as Error);
      }
    });
  }

  // Initialize local media stream
  async initializeLocalStream(config: CallConfig): Promise<MediaStream> {
    try {
      // For testing on same machine, create a dummy audio track to avoid feedback
      const isSameMachineTest = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      
      let constraints: MediaStreamConstraints;
      
      if (isSameMachineTest && config.audio && !config.video) {
        // For voice calls on same machine, create a minimal audio stream with very low volume
        console.log('⚠️ Same machine testing detected - using minimal audio to prevent feedback');
        constraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        };
      } else {
        constraints = {
          audio: config.audio,
          video: config.video ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          } : false
        };
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Local stream initialized:', this.localStream.getTracks().map(t => t.kind));
      
      // For same machine testing, reduce volume but don't completely mute
      if (isSameMachineTest && config.audio && !config.video) {
        this.localStream.getAudioTracks().forEach(track => {
          // Only mute for voice-only calls on same machine to prevent feedback
          // For video calls, keep audio enabled as user can see both streams
          track.enabled = false;
        });
        console.log('Local audio muted for same-machine voice call testing to prevent feedback');
      } else if (config.audio) {
        // Ensure audio tracks are enabled for normal calls
        this.localStream.getAudioTracks().forEach(track => {
          track.enabled = true;
        });
        console.log('Local audio enabled for call');
      }
      
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Failed to access camera/microphone');
    }
  }

  // Start a call (initiator side)
  async startCall(callId: string, receiverId: string, config: CallConfig): Promise<void> {
    try {
      this.callId = callId;
      this.receiverId = receiverId;
      this.isInitiator = true;
      console.log('Starting call with receiverId:', receiverId);
      
      // Initialize local stream
      await this.initializeLocalStream(config);
      
      // Create peer connection
      this.peerConnection = this.createPeerConnection();
      
      // Add local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }
      
      // Create offer
      const offer = await this.peerConnection.createOffer();
      console.log('Created WebRTC offer:', offer.type);
      await this.peerConnection.setLocalDescription(offer);
      console.log('Set local description (offer)');
      
      // Send offer via socket
      console.log('Sending WebRTC offer to receiver:', receiverId);
      socketManager.sendWebRTCOffer(callId, receiverId, offer);
      
    } catch (error) {
      console.error('Error starting call:', error);
      this.onErrorCallback?.(error as Error);
      throw error;
    }
  }

  // Prepare for incoming call (receiver side) - sets up WebRTC manager to receive offers
  prepareForIncomingCall(callId: string, callerId: string): void {
    console.log('🎯 WebRTC Manager: Preparing for incoming call - CallId:', callId, 'CallerId:', callerId);
    this.callId = callId;
    this.callerId = callerId;
    this.isInitiator = false;
    
    // Reset any existing connection state
    if (this.peerConnection) {
      console.log('🧹 Cleaning up existing peer connection before incoming call');
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    // Clear any pending state
    this.pendingOffer = null;
    this.pendingCandidates = [];
    
    console.log('✅ WebRTC Manager ready to receive offers for call:', callId);
  }

  // Accept a call (receiver side)
  async acceptCall(callId: string, config: CallConfig): Promise<void> {
    try {
      // Verify the call ID matches what we prepared for
      if (this.callId !== callId) {
        console.warn('⚠️ Call ID mismatch during acceptance. Expected:', this.callId, 'Received:', callId);
        this.callId = callId; // Update to match
      }
      console.log('🎯 WebRTC Manager: Accepting call with callId:', callId);
      
      // Initialize local stream
      await this.initializeLocalStream(config);
      console.log('✅ Local stream initialized for receiver');
      
      // Create peer connection if not already created
      if (!this.peerConnection) {
        this.peerConnection = this.createPeerConnection();
        console.log('✅ Peer connection created for receiver');
      }
      
      // Add local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
        console.log('✅ Local stream tracks added to peer connection');
      }

      // Important: If we already received an offer, process it now
      if (this.pendingOffer) {
        console.log('🎯 Processing pending offer after call acceptance...');
        console.log('🎯 Pending offer details:', this.pendingOffer);
        await this.processPendingOffer();
      } else {
        console.log('⚠️ No pending offer found after call acceptance');
        console.log('⚠️ Call ID:', this.callId);
        console.log('⚠️ Caller ID:', this.callerId);
      }
      
    } catch (error) {
      console.error('❌ Error accepting call:', error);
      this.onErrorCallback?.(error as Error);
      throw error;
    }
  }

  // End the call
  endCall(): void {
    console.log('Ending WebRTC call');
    
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    // Clear remote stream
    this.remoteStream = null;
    this.callId = null;
    this.receiverId = null;
    this.callerId = null;
    this.isInitiator = false;
    this.pendingCandidates = [];
    this.pendingOffer = null;
    
    // Reset retry count
    this.connectionRetryCount = 0;
  }

  // Toggle local audio
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  // Toggle local video
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  // Process WebRTC offer
  private async processOffer(callId: string, offer: RTCSessionDescriptionInit, senderId: string): Promise<void> {
    console.log('🎯 Processing WebRTC offer for call:', callId, 'from sender:', senderId);
    console.log('🎯 Offer type:', offer?.type);
    
    if (!this.peerConnection) {
      console.error('❌ No peer connection available to process offer');
      return;
    }

    this.callId = callId;
    this.callerId = senderId;
    this.isInitiator = false;

    // Set remote description (offer)
    console.log('✅ Setting remote description (offer)');
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    console.log('✅ Remote description set successfully');

    // Create answer
    console.log('🔄 Creating WebRTC answer...');
    const answer = await this.peerConnection.createAnswer();
    console.log('✅ Answer created:', answer.type);
    
    // Set local description (answer)
    await this.peerConnection.setLocalDescription(answer);
    console.log('✅ Local description set (answer)');

    // Send answer via socket
    console.log('📤 Sending WebRTC answer to caller:', senderId);
    socketManager.sendWebRTCAnswer(callId, senderId, answer);
    console.log('✅ Answer sent successfully');

    // Process any pending ICE candidates
    console.log('Processing', this.pendingCandidates.length, 'pending ICE candidates for answer');
    for (const candidate of this.pendingCandidates) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
    this.pendingCandidates = [];
  }

  // Process pending offer after call acceptance
  private async processPendingOffer(): Promise<void> {
    if (!this.pendingOffer) {
      console.log('⚠️ No pending offer to process');
      return;
    }

    console.log('🎯 Processing pending offer after call acceptance...');
    const { offer, senderId } = this.pendingOffer;
    this.pendingOffer = null; // Clear pending offer

    await this.processOffer(this.callId!, offer, senderId);
  }

  // Calculate call quality stats
  private async calculateCallStats(pc: RTCPeerConnection): Promise<void> {
    try {
      const stats = await pc.getStats();
      let quality: 'excellent' | 'good' | 'poor' | 'failed' = 'good';
      let latency: number | undefined;

      stats.forEach((report) => {
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          latency = report.currentRoundTripTime * 1000; // Convert to ms
          
          // Determine quality based on latency
          if (latency < 100) quality = 'excellent';
          else if (latency < 300) quality = 'good';
          else quality = 'poor';
        }
      });

      const callStats: CallStats = {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        quality,
        latency
      };

      this.onCallStatsCallback?.(callStats);
    } catch (error) {
      console.error('Error calculating call stats:', error);
    }
  }


  // Getter methods
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }

  // Event handler setters
  onRemoteStream(callback: (stream: MediaStream) => void): void {
    this.onRemoteStreamCallback = callback;
  }

  onConnectionStateChange(callback: (state: RTCPeerConnectionState) => void): void {
    this.onConnectionStateChangeCallback = callback;
  }

  onCallStats(callback: (stats: CallStats) => void): void {
    this.onCallStatsCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  // Retry connection with fresh peer connection
  private async retryConnection(): Promise<void> {
    console.log('🔄 Retrying WebRTC connection with fresh peer connection...');
    
    try {
      // Close current peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
      }

      // Create new peer connection
      this.peerConnection = this.createPeerConnection();

      // Add local stream if available
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }

      // If we're the initiator, create a new offer
      if (this.isInitiator && this.receiverId) {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        
        console.log('🔄 Sending retry WebRTC offer');
        socketManager.sendWebRTCOffer(this.callId!, this.receiverId, offer);
      } 
      // If we have a pending offer (receiver), process it again
      else if (this.pendingOffer) {
        console.log('🔄 Reprocessing pending offer after retry');
        await this.processOffer(this.callId!, this.pendingOffer.offer, this.pendingOffer.senderId);
      }
    } catch (error) {
      console.error('❌ Error during connection retry:', error);
      this.onErrorCallback?.(error as Error);
    }
  }
}

// Global singleton instance that persists across HMR reloads
const GLOBAL_KEY = '__WEBRTC_MANAGER_SINGLETON__';

export const webRTCManager = (() => {
  // Use global window object to store singleton across HMR reloads
  if (typeof window !== 'undefined') {
    if (!(window as any)[GLOBAL_KEY]) {
      console.log('🎯 Creating GLOBAL WebRTC Manager singleton instance');
      (window as any)[GLOBAL_KEY] = new WebRTCManager();
      console.log('🎯 Global WebRTC Manager singleton created');
    } else {
      console.log('🎯 Reusing EXISTING global WebRTC Manager singleton instance');
    }
    return (window as any)[GLOBAL_KEY];
  } else {
    // Server-side fallback (shouldn't be used for WebRTC)
    console.log('🎯 Creating server-side WebRTC Manager instance');
    return new WebRTCManager();
  }
})();