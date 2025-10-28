# FCM-Based Call Notifications Setup Guide

This guide will help you complete the setup for instant call notifications using Firebase Cloud Messaging (FCM) instead of Socket.io.

## Why FCM Instead of Socket?

**Problem with Socket.io:**
- Calls take a long time to initiate
- Delays at receiver side to accept calls
- Socket connections can be unreliable on mobile networks

**Benefits of FCM:**
- Instant push notifications (< 1 second delivery)
- Works even when app is in background
- Better battery efficiency
- Reliable delivery on all networks

---

## Frontend Setup (COMPLETED ✅)

The frontend implementation is now complete! Here's what was implemented:

### 1. Firebase SDK Integration ✅
- Installed `firebase` package
- Created Firebase configuration in `src/config/firebase.ts`
- Set up FCM token management

### 2. Service Workers ✅
- Updated `public/sw.js` to handle call notifications
- Created `public/firebase-messaging-sw.js` for background FCM
- Added "Accept" and "Decline" actions to call notifications

### 3. Call Notification Handling ✅
- Updated `src/utils/pushNotifications.ts` with FCM methods
- Modified `src/hooks/useVideoCall.ts` to listen for FCM notifications
- Set `video_enabled: false` for initial call state

### 4. Environment Variables ✅
- Created `.env.example` template
- Documented all required Firebase variables

---

## Frontend Configuration Needed

### Step 1: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing one)
3. Go to **Project Settings** > **General**
4. Scroll to **Your apps** section
5. Click **Add app** > **Web app** (</> icon)
6. Register your app and copy the config values

### Step 2: Get VAPID Key

1. In Firebase Console, go to **Project Settings** > **Cloud Messaging**
2. Scroll to **Web configuration**
3. Under **Web Push certificates**, click **Generate key pair**
4. Copy the VAPID key

### Step 3: Create .env.local File

Create `.env.local` in the root directory:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://thedashman.org

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abcdef
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BN5...
```

### Step 4: Update firebase-messaging-sw.js

Replace the placeholder config in `public/firebase-messaging-sw.js` with your actual Firebase config (lines 7-14).

---

## Backend Setup Needed ⚠️

The backend needs these changes to work with FCM:

### 1. Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### 2. Initialize Firebase Admin

Create `src/config/firebase-admin.js`:

```javascript
const admin = require('firebase-admin');

// Download service account key from Firebase Console
// Project Settings > Service Accounts > Generate new private key
const serviceAccount = require('./path-to-serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
```

### 3. Add FCM Token to User Model

Update your User model/schema:

```javascript
const userSchema = new Schema({
  // ... existing fields
  fcmToken: {
    type: String,
    default: null
  },
  fcmTokenUpdatedAt: {
    type: Date,
    default: null
  }
});
```

### 4. Create FCM Token Endpoint

Create `POST /api/v1/users/fcm-token`:

```javascript
router.post('/fcm-token', authenticate, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
      fcmToken,
      fcmTokenUpdatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'FCM token saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save FCM token',
      error: error.message
    });
  }
});
```

### 5. Modify Call Initiation to Send FCM

Update `POST /api/v1/calls/initiate`:

```javascript
const admin = require('../config/firebase-admin');

router.post('/initiate', authenticate, async (req, res) => {
  try {
    const { receiverId, chatId, callType } = req.body;
    const callerId = req.user._id;

    // Create call in database
    const call = await Call.create({
      participants: [callerId, receiverId],
      initiator: callerId,
      chatId,
      callType,
      status: 'initiated'
    });

    // Get receiver's FCM token
    const receiver = await User.findById(receiverId);

    if (receiver.fcmToken) {
      // Send FCM notification
      const message = {
        token: receiver.fcmToken,
        notification: {
          title: `Incoming ${callType} call`,
          body: `${req.user.fullName || req.user.username} is calling you...`
        },
        data: {
          type: 'incoming_call',
          callId: call._id.toString(),
          callerId: callerId.toString(),
          callerName: req.user.fullName || req.user.username,
          callerImage: req.user.profileImageUrl || '',
          chatId: chatId,
          callType: callType
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'calls',
            priority: 'high',
            defaultVibrateTimings: true,
            sound: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              contentAvailable: true
            }
          }
        }
      };

      try {
        await admin.messaging().send(message);
        console.log('✅ FCM notification sent successfully');
      } catch (fcmError) {
        console.error('❌ FCM notification failed:', fcmError);
        // Fall back to socket as backup
        io.to(receiverId).emit('incoming_call', {
          callId: call._id,
          caller: req.user,
          chatId,
          callType
        });
      }
    } else {
      // No FCM token, use socket as fallback
      io.to(receiverId).emit('incoming_call', {
        callId: call._id,
        caller: req.user,
        chatId,
        callType
      });
    }

    res.json({
      success: true,
      data: call,
      message: 'Call initiated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to initiate call',
      error: error.message
    });
  }
});
```

### 6. Update Stream.io Call Creation Endpoint

Modify `POST /api/v1/stream/call/create` to accept `video_enabled`:

```javascript
router.post('/call/create', authenticate, async (req, res) => {
  try {
    const { callId, callType, members, video_enabled = false } = req.body;

    // Create call in Stream.io
    const streamCallType = callType === 'voice' ? 'audio_room' : 'default';

    const call = client.video.call(streamCallType, callId);

    await call.getOrCreate({
      data: {
        members: members.map(memberId => ({ user_id: memberId })),
        settings_override: {
          video: {
            enabled: video_enabled  // Use the parameter from request
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        streamCallType,
        callId
      },
      message: 'Stream.io call created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create Stream.io call',
      error: error.message
    });
  }
});
```

---

## How the Flow Works

### 1. Caller initiates call:
```
User clicks "Call" button
  ↓
Frontend: POST /api/v1/calls/initiate
  ↓
Backend: Creates call in DB
  ↓
Backend: Sends FCM push notification to receiver
  ↓
Backend: Returns call data to caller
  ↓
Frontend: Opens call UI (with video_enabled=false)
```

### 2. Receiver gets notification:
```
FCM push arrives (< 1 second!)
  ↓
Shows notification with "Accept" and "Decline" buttons
  ↓
User clicks "Accept"
  ↓
Frontend: POST /api/v1/calls/{callId}/accept
  ↓
Frontend: Opens call UI and joins Stream.io room
```

### 3. Both users connect:
```
Caller and Receiver join same Stream.io room
  ↓
Video/Audio streaming begins
  ↓
Socket.io used for call state updates (ended, declined, etc.)
```

---

## Testing

### 1. Test FCM Token Registration

```bash
# Check browser console after login
# Should see: "FCM Token obtained: ..."
# Should see: "FCM token sent to backend successfully"
```

### 2. Test Call Notification

1. User A calls User B
2. Check that User B gets notification within 1 second
3. Notification should have "Accept" and "Decline" buttons
4. Test both actions

### 3. Test Video Disabled

1. Accept a call
2. Video should be OFF initially
3. User can manually enable video using controls

---

## Troubleshooting

### "FCM token not sent to backend"
- Check that `.env.local` has all Firebase variables
- Verify notification permission is granted
- Check network tab for API call to `/api/v1/users/fcm-token`

### "Notification not received"
- Verify backend has Firebase Admin SDK configured
- Check backend logs for FCM send errors
- Ensure receiver has granted notification permission
- Test with `firebase.messaging().getToken()` in browser console

### "Video starts enabled"
- Check that backend passes `video_enabled: false` to Stream.io
- Verify `settings_override.video.enabled` is being set

---

## Key Files Modified

### Frontend:
- ✅ `src/config/firebase.ts` - Firebase configuration
- ✅ `src/utils/pushNotifications.ts` - FCM token management
- ✅ `src/hooks/useVideoCall.ts` - Call notification handling
- ✅ `src/api/stream.ts` - video_enabled parameter
- ✅ `public/sw.js` - Service worker for notifications
- ✅ `public/firebase-messaging-sw.js` - FCM background handler

### Backend (TODO):
- ⚠️ User model - Add `fcmToken` field
- ⚠️ `POST /api/v1/users/fcm-token` - Save FCM tokens
- ⚠️ `POST /api/v1/calls/initiate` - Send FCM notification
- ⚠️ `POST /api/v1/stream/call/create` - Handle `video_enabled`
- ⚠️ Firebase Admin SDK initialization

---

## Next Steps

1. **Add Firebase credentials to `.env.local`**
2. **Update `firebase-messaging-sw.js` with your Firebase config**
3. **Implement backend changes (User model, FCM endpoint, call initiation)**
4. **Test end-to-end flow**
5. **Deploy and monitor FCM delivery**

---

## Additional Features You Can Add

### 1. Call Ringtone
Add a ringtone sound when notification arrives

### 2. Missed Call Tracking
Store missed calls when user doesn't answer within X seconds

### 3. Call History with FCM
Send FCM for call ended, missed, declined events

### 4. Multi-device Support
Same user can receive call on multiple devices

---

## Questions or Issues?

If you encounter any problems:
1. Check browser console for errors
2. Check backend logs for FCM errors
3. Verify Firebase credentials are correct
4. Test FCM token registration first
5. Use Socket.io as fallback if FCM fails

Good luck! 🚀
