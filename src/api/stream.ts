import apiClient from './base';

/**
 * Stream.io Video API
 *
 * Backend implementation required:
 *
 * POST /api/v1/stream/token
 *
 * Request headers:
 * - Authorization: Bearer <user_jwt_token>
 *
 * Response format:
 * {
 *   success: true,
 *   data: {
 *     token: string,          // Stream.io user token (JWT)
 *     userId: string,         // User ID in your system
 *     expiresAt?: string      // Optional token expiration
 *   },
 *   message: string
 * }
 *
 * Backend should:
 * 1. Verify user authentication
 * 2. Generate Stream.io token using Stream SDK with your API secret
 * 3. Return the token for the authenticated user
 *
 * Example Node.js implementation:
 *
 * import { StreamClient } from '@stream-io/node-sdk';
 *
 * const streamClient = new StreamClient(
 *   process.env.STREAM_API_KEY,
 *   process.env.STREAM_API_SECRET
 * );
 *
 * const token = streamClient.createToken(userId);
 *
 * res.json({
 *   success: true,
 *   data: { token, userId },
 *   message: 'Token generated successfully'
 * });
 */

export interface StreamTokenResponse {
  token: string;
  userId: string;
  expiresAt?: string;
}

export interface CreateStreamCallRequest {
  callId: string;
  callType: 'voice' | 'video';
  members: string[];
}

export interface CreateStreamCallResponse {
  streamCallType: 'audio_room' | 'default';
  callId: string;
}

export const streamAPI = {
  // Get Stream.io token for video calls
  getStreamToken: async (): Promise<string> => {
    try {
      const response = await apiClient.post<{ success: boolean; data: StreamTokenResponse; message: string }>('/stream/token');
      return response.data.data.token;
    } catch (error: any) {
      console.error('Failed to fetch Stream.io token:', error);
      throw error;
    }
  },

  // Create Stream.io call with proper settings
  createStreamCall: async (data: CreateStreamCallRequest): Promise<CreateStreamCallResponse> => {
    try {
      const response = await apiClient.post<{ success: boolean; data: CreateStreamCallResponse; message: string }>('/stream/call/create', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to create Stream.io call:', error);
      throw error;
    }
  }
};
