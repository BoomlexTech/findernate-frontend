# Agora Call Implementation - Critical Fixes

## Issues Identified

### 1. 🔴 CRITICAL: Media Permission Delays (5-10 seconds)
**Location:** `src/hooks/useAgora.ts:646-652` (acceptCall), `512-518` (initiateCall)

**Problem:**
- Camera/microphone permissions requested **synchronously** during call acceptance
- Blocks entire call flow for 2-10 seconds
- User sees loading spinner with no feedback
- If permissions denied, call fails completely

**Current Flow:**
```
User clicks Accept → Accept API call → Get Agora token → Request camera → Request mic → Join channel
                                                           ↑
                                                    (5-10 seconds delay!)
```

**Fix:** Pre-warm media tracks when incoming call arrives

```typescript
// In useAgora.ts - Add new state
const [preWarmedTracks, setPreWarmedTracks] = useState<{
  audio: any | null;
  video: any | null;
}>({ audio: null, video: null });

// Modify incoming_call handler (line 375)
socketManager.on('incoming_call', async (data: IncomingCall) => {
  console.log('Incoming call received:', data);
  setIncomingCall(data);
  ringtoneManager.startRingtone('incoming');

  // PRE-WARM MEDIA TRACKS (do this in background while user decides)
  if (isSDKReady && AgoraRTC) {
    try {
      console.log('🎥 Pre-warming media tracks...');
      const audio = await AgoraRTC.createMicrophoneAudioTrack();
      const video = data.callType === 'video'
        ? await AgoraRTC.createCameraVideoTrack()
        : null;

      // Disable tracks initially (don't publish yet)
      audio.setEnabled(false);
      if (video) video.setEnabled(false);

      setPreWarmedTracks({ audio, video });
      console.log('✅ Media tracks pre-warmed');
    } catch (error) {
      console.error('⚠️ Failed to pre-warm tracks:', error);
      // Don't fail - user can still try to accept
    }
  }

  // ... rest of handler
});

// Modify acceptCall to use pre-warmed tracks (line 642-652)
// Create local tracks - use pre-warmed if available
let localAudioTrack: any = null;
let localVideoTrack: any = null;

if (preWarmedTracks.audio && preWarmedTracks.video) {
  console.log('✅ Using pre-warmed tracks');
  localAudioTrack = preWarmedTracks.audio;
  localVideoTrack = incomingCall.callType === 'video' ? preWarmedTracks.video : null;

  // Enable them now
  localAudioTrack.setEnabled(true);
  if (localVideoTrack) localVideoTrack.setEnabled(true);

  // Clear pre-warmed tracks
  setPreWarmedTracks({ audio: null, video: null });
} else {
  // Fallback to creating fresh tracks
  if (incomingCall.callType === 'video') {
    localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    localVideoTrack.setEnabled(true);
  }
  localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  localAudioTrack.setEnabled(true);
}

// IMPORTANT: Clean up pre-warmed tracks if call is declined
// Modify declineCall (line 701)
const declineCall = useCallback(async () => {
  // ... existing code ...

  // Clean up pre-warmed tracks
  if (preWarmedTracks.audio) {
    preWarmedTracks.audio.stop();
    preWarmedTracks.audio.close();
  }
  if (preWarmedTracks.video) {
    preWarmedTracks.video.stop();
    preWarmedTracks.video.close();
  }
  setPreWarmedTracks({ audio: null, video: null });

  // ... rest of handler
}, [incomingCall, handleError, preWarmedTracks]);
```

**Expected Improvement:** Reduces acceptance time from 5-10s to <1s

---

### 2. 🔴 CRITICAL: Agora Client Not Reused
**Location:** `src/hooks/useAgora.ts:118-122, 505, 640`

**Problem:**
```typescript
if (!agoraClientRef.current) {
  agoraClientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  // ... setup event listeners
}
```
Client is created once, but **never reset** after leaving channel. On next call, stale client causes delays.

**Fix:**
```typescript
// In endCallLocally (line 342-345)
// Leave the channel
if (agoraClientRef.current) {
  await agoraClientRef.current.leave();

  // IMPORTANT: Remove all event listeners to prevent memory leaks
  agoraClientRef.current.removeAllListeners();

  // Reset client ref so next call creates fresh client
  agoraClientRef.current = null;
}
```

---

### 3. 🟡 HIGH: Sequential API Calls
**Location:** `src/hooks/useAgora.ts:625-627`

**Problem:**
```typescript
const agoraChannelDetails = await getAgoraChannelDetails(callIdToAccept); // 200-500ms
const agoraToken = await getAgoraToken(callIdToAccept);                    // 200-500ms
// Total: 400-1000ms sequential delay
```

**Fix:** Parallelize requests
```typescript
// Get Agora credentials in parallel
console.log('🔑 Requesting Agora credentials for accepted call:', callIdToAccept);
const [agoraChannelDetails, agoraToken] = await Promise.all([
  getAgoraChannelDetails(callIdToAccept),
  getAgoraToken(callIdToAccept)
]);
console.log('✅ Agora credentials obtained successfully');
```

**Also apply to initiateCall (line 491-493)**

---

### 4. 🟡 HIGH: State Updates Causing Re-renders
**Location:** `src/hooks/useAgora.ts:631-637, 654-657`

**Problem:** Multiple sequential `updateCallState` calls during acceptance:
```typescript
updateCallState({ call, isInCall: true, ... });  // Render 1
// ... create tracks ...
updateCallState({ localAudioTrack, localVideoTrack });  // Render 2
```

Each causes component re-render, slowing UI.

**Fix:** Batch state updates
```typescript
// After creating tracks, update once
updateCallState({
  call,
  isInCall: true,
  isInitiator: false,
  isVideoEnabled: incomingCall.callType === 'video',
  agoraChannelDetails: agoraChannelDetails,
  localAudioTrack,
  localVideoTrack
});
```

---

### 5. 🟡 HIGH: Socket Emit After Everything
**Location:** `src/hooks/useAgora.ts:672-673`

**Problem:**
```typescript
await client.join(...);
await client.publish(...);
// Only NOW notify caller
socketManager.acceptCall(incomingCall.callId, incomingCall.caller._id);
```

Caller waits for receiver to fully join before getting notification.

**Fix:** Emit socket event earlier
```typescript
// Accept call on backend FIRST
const call = await callAPI.acceptCall(callIdToAccept);

// Immediately notify caller via socket (don't wait for Agora setup)
socketManager.acceptCall(incomingCall.callId, incomingCall.caller._id);
console.log('✅ Call acceptance emitted to caller');

// Now do Agora setup
const [agoraChannelDetails, agoraToken] = await Promise.all([...]);
// ... rest of flow
```

---

### 6. 🔴 CRITICAL: Missing Error Recovery
**Location:** `src/hooks/useAgora.ts:677-694`

**Problem:** If ANY step fails (token, join, publish), entire call fails with no retry.

**Fix:** Add retry logic for transient failures
```typescript
// Helper function for retrying operations
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.warn(`❌ Attempt ${attempt + 1} failed:`, error.message);

      // Don't retry on permanent errors
      if (error.message?.includes('PERMISSION_DENIED') ||
          error.message?.includes('Invalid token')) {
        throw error;
      }

      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // Exponential backoff
      }
    }
  }

  throw lastError;
};

// Use in acceptCall
try {
  // ... existing code ...

  // Join with retry
  await retryOperation(() =>
    client.join(agoraToken.appId, agoraToken.channelName, agoraToken.rtcToken, agoraToken.uid),
    2,
    1000
  );
  console.log('Joined Agora RTC channel successfully');

  // Publish with retry
  await retryOperation(() =>
    localVideoTrack
      ? client.publish([localAudioTrack, localVideoTrack])
      : client.publish([localAudioTrack]),
    2,
    500
  );
  console.log('Published local tracks');

} catch (error: any) {
  console.error('❌ Error accepting call after retries:', error);
  // ... existing error handling
}
```

---

### 7. 🟠 MEDIUM: No User Feedback During Delays
**Location:** `src/components/call/IncomingCallModal.tsx:157-160`

**Problem:** Generic "Starting call..." message doesn't show what's actually happening.

**Fix:** Add granular loading states
```typescript
// In useAgora.ts, add detailed loading state
const [loadingState, setLoadingState] = useState<{
  isLoading: boolean;
  message: string;
}>({ isLoading: false, message: '' });

// Update throughout acceptCall
setLoadingState({ isLoading: true, message: 'Accepting call...' });
// ... backend accept
setLoadingState({ isLoading: true, message: 'Getting credentials...' });
// ... get tokens
setLoadingState({ isLoading: true, message: 'Accessing camera & microphone...' });
// ... create tracks
setLoadingState({ isLoading: true, message: 'Connecting to call...' });
// ... join channel
setLoadingState({ isLoading: false, message: '' });
```

---

## Testing Plan

1. **Test Pre-Warmed Tracks:**
   - Make call between two devices
   - Accept call - should connect in <1 second
   - Decline call - verify tracks are cleaned up (no camera/mic indicator stays on)

2. **Test Permission Denial:**
   - Deny camera/mic permissions
   - Accept call - should fail gracefully with clear error

3. **Test Network Issues:**
   - Throttle network to 3G speed
   - Accept call - should retry and eventually connect or show clear timeout

4. **Test Parallel Calls:**
   - Have User A call User B
   - While ringing, have User C call User B
   - Verify only one call modal shows

---

## Priority Order

1. **Media Pre-Warming** (Fix #1) - IMMEDIATE - Reduces 80% of delay
2. **Parallelize API Calls** (Fix #3) - EASY WIN - Saves 500ms
3. **Socket Emit Early** (Fix #5) - QUICK - Better perceived performance
4. **Batch State Updates** (Fix #4) - EASY - Smoother UI
5. **Agora Client Reset** (Fix #2) - IMPORTANT - Prevents issues on 2nd+ calls
6. **Error Retry Logic** (Fix #6) - ROBUST - Handles flaky networks
7. **Better Loading States** (Fix #7) - POLISH - Better UX
