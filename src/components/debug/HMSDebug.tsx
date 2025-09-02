'use client';

import React, { useState } from 'react';
import { callAPI } from '@/api/call';
import { getHMSToken, getHMSRoomDetails } from '@/utils/hms';

export const HMSDebug: React.FC = () => {
  const [callId, setCallId] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const debugCall = async (id: string) => {
    setLoading(true);
    try {
      console.log('🔍 Debugging call ID:', id);
      
      // First, let's see the call details
      const roomDetails = await getHMSRoomDetails(id);
      console.log('🏠 Room details response:', roomDetails);
      
      // Then get the token
      const tokenData = await getHMSToken(id, 'host');
      console.log('🔑 Token data response:', tokenData);
      
      // Decode the JWT to see what's inside
      let decodedToken = null;
      try {
        const payload = JSON.parse(atob(tokenData.authToken.split('.')[1]));
        decodedToken = payload;
        console.log('🔍 Decoded JWT:', payload);
      } catch (e) {
        console.error('Failed to decode JWT:', e);
      }
      
      setDebugInfo({
        roomDetails,
        tokenData,
        decodedToken,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Debug error:', error);
      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    setLoading(false);
  };

  const testBackendEndpoints = async () => {
    setLoading(true);
    try {
      console.log('🔍 Testing backend endpoints...');
      
      // Test if basic API is working
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      console.log('🌐 API Base URL:', baseUrl);
      
      // Try to test different endpoint patterns
      const tests = [];
      
      try {
        const response = await fetch(`${baseUrl}/api/v1/calls`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        tests.push({
          endpoint: '/calls (GET)',
          status: response.status,
          ok: response.ok
        });
      } catch (e) {
        tests.push({
          endpoint: '/calls (GET)', 
          error: e.message
        });
      }

      try {
        const response = await fetch(`${baseUrl}/api/v1/calls/active`, {
          method: 'GET', 
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        tests.push({
          endpoint: '/calls/active (GET)',
          status: response.status,
          ok: response.ok,
          data: response.ok ? await response.text() : null
        });
      } catch (e) {
        tests.push({
          endpoint: '/calls/active (GET)',
          error: e.message  
        });
      }

      // Test the specific initiate endpoint
      try {
        const response = await fetch(`${baseUrl}/api/v1/calls/initiate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            receiverId: '60f1b2b9c9e1c40015f5c9a1',
            chatId: '68b545116277629b667d6ba0', 
            callType: 'video'
          })
        });
        const responseText = await response.text();
        tests.push({
          endpoint: '/calls/initiate (POST)',
          status: response.status,
          ok: response.ok,
          data: responseText || 'No response body'
        });
      } catch (e) {
        tests.push({
          endpoint: '/calls/initiate (POST)',
          error: e.message
        });
      }

      // Test backend health and HMS config
      try {
        const response = await fetch(`${baseUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const healthData = await response.json();
        tests.push({
          endpoint: '/health (GET)',
          status: response.status,
          ok: response.ok,
          data: healthData
        });
      } catch (e) {
        tests.push({
          endpoint: '/health (GET)',
          error: e.message
        });
      }
      
      setDebugInfo({
        message: 'Backend endpoint test results',
        baseUrl,
        tests,
        diagnosis: 'If calls/initiate fails with "Chat not found", your backend HMS token generation is likely missing HMS environment variables (HMS_ACCESS_KEY, HMS_SECRET, HMS_VOICE_TEMPLATE_ID, HMS_VIDEO_TEMPLATE_ID)',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Backend test failed:', error);
      setDebugInfo({
        error: `Backend test failed: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
    setLoading(false);
  };

  const testManualCall = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing HMS token generation directly...');
      
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      
      // First create a call with valid data - we just want to test HMS token generation
      const testChatId = '68b545116277629b667d6ba0';
      const testReceiverId = '68b544ee6277629b667d6a04'; // Valid receiver ID
      
      const callResponse = await fetch(`${baseUrl}/api/v1/calls/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: testReceiverId,
          chatId: testChatId,
          callType: 'video'
        })
      });

      const callResult = await callResponse.text();
      let callData = null;
      
      try {
        callData = JSON.parse(callResult);
      } catch (e) {
        callData = { rawResponse: callResult };
      }

      console.log('📞 Call creation result:', callData);

      if (callResponse.ok && callData?.data?._id) {
        // Call created! Now test HMS token generation
        const tokenResponse = await fetch(`${baseUrl}/api/v1/calls/${callData.data._id}/hms-token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role: 'host' })
        });

        const tokenResult = await tokenResponse.text();
        let tokenData = null;
        
        try {
          tokenData = JSON.parse(tokenResult);
          // Try to decode the JWT token
          if (tokenData?.data?.authToken) {
            const payload = JSON.parse(atob(tokenData.data.authToken.split('.')[1]));
            tokenData.decodedToken = payload;
            console.log('🔍 Decoded HMS JWT:', payload);
          }
        } catch (e) {
          tokenData = { rawResponse: tokenResult, decodeError: e.message };
        }

        setDebugInfo({
          message: 'HMS Manual Test Results',
          note: 'Testing HMS token generation directly',
          callCreation: {
            status: callResponse.status,
            ok: callResponse.ok,
            data: callData
          },
          tokenGeneration: {
            status: tokenResponse.status,
            ok: tokenResponse.ok,
            data: tokenData
          },
          diagnosis: tokenData?.decodedToken?.room_id ? 
            '✅ SUCCESS! HMS token contains room_id. Your backend HMS config is working!' :
            tokenData?.decodedToken ?
            `❌ HMS token missing room_id. Token contains: ${Object.keys(tokenData.decodedToken).join(', ')}` :
            '❌ Could not decode HMS token or token generation failed',
          nextSteps: tokenData?.decodedToken?.room_id ?
            'HMS integration is working! Try making a real video call.' :
            'Check backend logs and ensure HMS environment variables are set correctly.',
          timestamp: new Date().toISOString()
        });
      } else {
        setDebugInfo({
          error: 'Manual call creation failed',
          callResponse: {
            status: callResponse.status,
            data: callData
          },
          diagnosis: callResponse.status === 403 ? 
            'Receiver ID or Chat ID validation failed' :
            'Backend error - check backend logs',
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('❌ Manual test failed:', error);
      setDebugInfo({
        error: error.message,
        diagnosis: 'Network error or backend not responding',
        timestamp: new Date().toISOString()
      });
    }
    setLoading(false);
  };

  const testRealCall = async () => {
    setLoading(true);
    try {
      console.log('🎯 Testing real HMS call creation...');
      
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      
      // First, get real chats to use for testing
      const chatsResponse = await fetch(`${baseUrl}/api/v1/chats?page=1&limit=5&chatStatus=active`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      let realChat = null;
      let receiverId = null;
      
      if (chatsResponse.ok) {
        const chatsData = await chatsResponse.json();
        console.log('📱 Got chats data:', chatsData);
        
        if (chatsData.data && chatsData.data.length > 0) {
          realChat = chatsData.data[0]; // Use first chat
          // Find the other participant (not current user)
          const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')._id;
          receiverId = realChat.participants.find(p => p._id !== currentUserId)?._id;
        }
      }

      // If no active chats found, try to get specific chat details
      if (!realChat || !receiverId) {
        console.log('⚠️ No active chats found, trying to get chat details');
        const testChatId = '68b545116277629b667d6ba0';
        
        // Try different chat endpoint patterns to find participants
        let chatData = null;
        let endpointUsed = '';
        
        // Try multiple possible endpoints
        const endpoints = [
          `${baseUrl}/api/v1/chats/${testChatId}`,
          `${baseUrl}/api/v1/chat/${testChatId}`,
          `${baseUrl}/api/v1/chats/details/${testChatId}`
        ];
        
        for (const endpoint of endpoints) {
          try {
            const chatResponse = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (chatResponse.ok) {
              chatData = await chatResponse.json();
              endpointUsed = endpoint;
              console.log('📱 Got chat data from:', endpoint, chatData);
              break;
            }
          } catch (e) {
            console.log('Failed endpoint:', endpoint, e.message);
          }
        }
        
        // If still no chat data, try getting from the chats list
        if (!chatData) {
          console.log('🔍 Trying to find chat in chats list...');
          const allChatsResponse = await fetch(`${baseUrl}/api/v1/chats?limit=50`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (allChatsResponse.ok) {
            const allChatsData = await allChatsResponse.json();
            console.log('📋 All chats:', allChatsData);
            
            // Find the specific chat in the list
            let foundChat = null;
            if (allChatsData.data && allChatsData.data.chats) {
              foundChat = allChatsData.data.chats.find(chat => chat._id === testChatId);
            } else if (allChatsData.data && Array.isArray(allChatsData.data)) {
              foundChat = allChatsData.data.find(chat => chat._id === testChatId);
            }
            
            if (foundChat) {
              chatData = { data: foundChat };
              endpointUsed = 'Found in chats list';
              console.log('✅ Found chat in list:', foundChat);
            }
          }
        }
        
        if (chatData && chatData.data && chatData.data.participants) {
          const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')._id;
          console.log('🔍 Current user ID:', currentUserId);
          console.log('🔍 Chat participants:', chatData.data.participants);
          
          const otherParticipant = chatData.data.participants.find(p => {
            const participantId = typeof p === 'object' ? p._id : p;
            return participantId !== currentUserId;
          });
          
          if (otherParticipant) {
            receiverId = typeof otherParticipant === 'object' ? otherParticipant._id : otherParticipant;
            console.log('✅ Found other participant:', receiverId);
          } else {
            console.log('❌ All participants seem to be the current user');
            // For testing purposes, let's use a valid receiver ID
            const validReceiverId = '68b544ee6277629b667d6a04'; // Valid receiver ID
            receiverId = validReceiverId;
            console.log('🧪 Using valid receiver ID for testing:', receiverId);
          }
        }
        
        if (!receiverId) {
          setDebugInfo({
            error: 'Could not find valid participants in the test chat',
            chatId: testChatId,
            endpointsTried: endpoints,
            endpointUsed,
            chatData: chatData,
            diagnosis: 'Chat exists but could not access participants. Check API endpoints or permissions.',
            timestamp: new Date().toISOString()
          });
          setLoading(false);
          return;
        }
        
        const testReceiverId = receiverId;
        
        const callResponse = await fetch(`${baseUrl}/api/v1/calls/initiate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            receiverId: testReceiverId,
            chatId: testChatId, 
            callType: 'video'
          })
        });

        const callResult = await callResponse.text();
        let callData = null;
        
        try {
          callData = JSON.parse(callResult);
        } catch (e) {
          callData = { rawResponse: callResult };
        }

        if (callResponse.ok && callData?.data?._id) {
          // Call created! Now test token generation
          const tokenResponse = await fetch(`${baseUrl}/api/v1/calls/${callData.data._id}/hms-token`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: 'host' })
          });

          const tokenResult = await tokenResponse.text();
          let tokenData = null;
          
          try {
            tokenData = JSON.parse(tokenResult);
            // Try to decode the JWT token
            if (tokenData?.data?.authToken) {
              const payload = JSON.parse(atob(tokenData.data.authToken.split('.')[1]));
              tokenData.decodedToken = payload;
            }
          } catch (e) {
            tokenData = { rawResponse: tokenResult, decodeError: e.message };
          }

          setDebugInfo({
            message: 'HMS test with hardcoded data',
            note: 'Using test chat ID since no active chats found',
            callCreation: {
              status: callResponse.status,
              ok: callResponse.ok,
              data: callData
            },
            tokenGeneration: {
              status: tokenResponse.status,
              ok: tokenResponse.ok,
              data: tokenData
            },
            diagnosis: tokenData?.decodedToken?.room_id ? 
              '✅ HMS token contains room_id! Backend HMS config is working.' :
              '❌ HMS token still missing room_id. Backend HMS environment variables not set correctly.',
            timestamp: new Date().toISOString()
          });
        } else {
          setDebugInfo({
            error: 'Call creation failed with test data',
            callResponse: {
              status: callResponse.status,
              data: callData
            },
            testData: { testChatId, testReceiverId },
            timestamp: new Date().toISOString()
          });
        }
        
        setLoading(false);
        return;
      }

      // Test call creation with real data
      const callResponse = await fetch(`${baseUrl}/api/v1/calls/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: receiverId,
          chatId: realChat._id, 
          callType: 'video'
        })
      });

      const callResult = await callResponse.text();
      let callData = null;
      
      try {
        callData = JSON.parse(callResult);
      } catch (e) {
        callData = { rawResponse: callResult };
      }

      if (callResponse.ok && callData?.data?._id) {
        // Call created successfully, now test HMS token
        const tokenResponse = await fetch(`${baseUrl}/api/v1/calls/${callData.data._id}/hms-token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role: 'host' })
        });

        const tokenResult = await tokenResponse.text();
        let tokenData = null;
        
        try {
          tokenData = JSON.parse(tokenResult);
          // Try to decode the JWT token
          if (tokenData?.data?.authToken) {
            const payload = JSON.parse(atob(tokenData.data.authToken.split('.')[1]));
            tokenData.decodedToken = payload;
          }
        } catch (e) {
          tokenData = { rawResponse: tokenResult, decodeError: e.message };
        }

        setDebugInfo({
          message: 'Real HMS call test successful!',
          callCreation: {
            status: callResponse.status,
            ok: callResponse.ok,
            data: callData
          },
          tokenGeneration: {
            status: tokenResponse.status,
            ok: tokenResponse.ok,
            data: tokenData
          },
          timestamp: new Date().toISOString()
        });
      } else {
        setDebugInfo({
          message: 'Call creation failed',
          callCreation: {
            status: callResponse.status,
            ok: callResponse.ok,
            error: callResult
          },
          usedData: {
            receiverId,
            chatId: realChat._id,
            callType: 'video'
          },
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('❌ Real call test failed:', error);
      setDebugInfo({
        error: `Real call test failed: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
      <h3 className="text-lg font-bold mb-2 text-black">🐛 HMS Debug Tool</h3>
      <p className="text-sm text-gray-700 mb-4">
        <strong>Problem:</strong> HMS JWT tokens are missing room_id and user_id fields. This means your backend's 
        HMS configuration is incomplete.<br/>
        <strong>Solution:</strong> Your deployed backend needs these environment variables:
        <code className="bg-gray-200 px-1 rounded">HMS_ACCESS_KEY</code>, 
        <code className="bg-gray-200 px-1 rounded">HMS_SECRET</code>, 
        <code className="bg-gray-200 px-1 rounded">HMS_VOICE_TEMPLATE_ID</code>, 
        <code className="bg-gray-200 px-1 rounded">HMS_VIDEO_TEMPLATE_ID</code>
      </p>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={testBackendEndpoints}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Backend Endpoints'}
          </button>
          <button
            onClick={() => testRealCall()}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Real HMS Call'}
          </button>
          <button
            onClick={testManualCall}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test HMS Token Only'}
          </button>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={callId}
            onChange={(e) => setCallId(e.target.value)}
            placeholder="Enter Call ID to debug"
            className="flex-1 px-3 py-2 border rounded text-black placeholder-gray-500"
          />
          <button
            onClick={() => debugCall(callId)}
            disabled={!callId || loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Debug Call
          </button>
        </div>
        
        {debugInfo && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2 text-black">Debug Results ({debugInfo.timestamp}):</h4>
            <pre className="bg-gray-50 text-black border p-4 rounded overflow-auto text-sm max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};