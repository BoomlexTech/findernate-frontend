# Backend FCM Debugging Guide

## ✅ Confirmed Working:
- Frontend Firebase config: `findernate-900de`
- Backend Firebase config: `findernate-900de`
- FCM tokens are being saved to backend successfully
- Socket.IO notifications are working

## ❌ Not Working:
- FCM notifications are not being sent when call is initiated

---

## Step 1: Verify Firebase Admin SDK Initialization

**File:** `src/config/firebase-admin.config.js` or wherever Firebase Admin is initialized

Add this logging:

```javascript
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
  console.log('✅ Firebase Admin SDK initialized successfully');
  console.log('📱 Project ID:', admin.app().options.projectId);
  console.log('📧 Service Account:', admin.app().options.credential.clientEmail);
} else {
  console.log('ℹ️ Firebase Admin SDK already initialized');
}

// Test that messaging is accessible
try {
  const messaging = admin.messaging();
  console.log('✅ Firebase Messaging accessible');
} catch (error) {
  console.error('❌ Firebase Messaging not accessible:', error.message);
}
```

**Expected Output on Server Start:**
```
✅ Firebase Admin SDK initialized successfully
📱 Project ID: findernate-900de
📧 Service Account: firebase-adminsdk-fbsvc@findernate-900de.iam.gserviceaccount.com
✅ Firebase Messaging accessible
```

---

## Step 2: Add Logging to Call Initiation

**File:** `src/controllers/call.controllers.js` (around line 200-300)

In your `initiateCall` function, add comprehensive logging:

```javascript
exports.initiateCall = async (req, res) => {
  try {
    const { receiverId, chatId, callType } = req.body;
    const callerId = req.user.id;

    console.log('\n🔔 ========== CALL INITIATION START ==========');
    console.log('📞 Caller ID:', callerId);
    console.log('📞 Receiver ID:', receiverId);
    console.log('📞 Call Type:', callType);

    // ... your code to create call record ...

    // Get receiver details
    const receiver = await User.findById(receiverId);

    console.log('👤 Receiver found:', receiver.username);
    console.log('📱 Receiver FCM token exists:', !!receiver.fcmToken);
    console.log('📱 Receiver FCM token value:', receiver.fcmToken ? receiver.fcmToken.substring(0, 50) + '...' : 'NONE');
    console.log('📅 FCM token updated at:', receiver.fcmTokenUpdatedAt);

    // Check Firebase Admin
    const admin = require('firebase-admin');
    console.log('🔥 Firebase Admin apps count:', admin.apps.length);
    console.log('🔥 Firebase Admin initialized:', !!admin.apps.length);

    // Attempt to send FCM notification
    if (!receiver.fcmToken) {
      console.warn('⚠️ SKIPPING FCM: Receiver has no FCM token');
    } else {
      console.log('📤 Attempting to send FCM notification...');

      try {
        const fcmPayload = {
          notification: {
            title: `Incoming ${callType} call`,
            body: `${req.user.fullName || req.user.username} is calling you...`
          },
          data: {
            type: 'incoming_call',
            callId: call._id.toString(),
            callerId: callerId,
            callerName: req.user.fullName || req.user.username,
            callerImage: req.user.profileImageUrl || '',
            chatId: chatId,
            callType: callType
          },
          token: receiver.fcmToken
        };

        console.log('📦 FCM Payload:', JSON.stringify(fcmPayload, null, 2));

        const response = await admin.messaging().send(fcmPayload);

        console.log('✅ FCM notification sent successfully!');
        console.log('📱 FCM Response:', response);

      } catch (fcmError) {
        console.error('❌ FCM send failed!');
        console.error('❌ Error name:', fcmError.name);
        console.error('❌ Error code:', fcmError.code);
        console.error('❌ Error message:', fcmError.message);
        console.error('❌ Full error:', fcmError);

        // If token is invalid, clear it
        if (fcmError.code === 'messaging/invalid-registration-token' ||
            fcmError.code === 'messaging/registration-token-not-registered') {
          console.warn('⚠️ Clearing invalid FCM token for user:', receiverId);
          await User.findByIdAndUpdate(receiverId, {
            $unset: { fcmToken: 1, fcmTokenUpdatedAt: 1 }
          });
        }
      }
    }

    // Also send Socket.IO as backup
    console.log('📡 Sending Socket.IO notification...');
    // ... your socket.io code ...
    console.log('✅ Socket.IO notification sent');

    console.log('🔔 ========== CALL INITIATION END ==========\n');

    res.status(201).json({
      success: true,
      data: call,
      message: 'Call initiated successfully'
    });

  } catch (error) {
    console.error('❌ Call initiation failed:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

---

## Step 3: What to Look For in Backend Logs

When someone initiates a call, you should see:

### ✅ SUCCESS Pattern:
```
🔔 ========== CALL INITIATION START ==========
📞 Caller ID: 68e395d5396f445e79e7e2f1
📞 Receiver ID: 68e4a6f1d37e032b58aa7cf5
📞 Call Type: voice
👤 Receiver found: lucifer7277
📱 Receiver FCM token exists: true
📱 Receiver FCM token value: eNXPS7ERSxd6mt7Rvg3md6:APA91bEN4KB9OCGj1fUvf55Tq0...
📅 FCM token updated at: 2025-11-07T12:52:56.219Z
🔥 Firebase Admin apps count: 1
🔥 Firebase Admin initialized: true
📤 Attempting to send FCM notification...
📦 FCM Payload: { ... }
✅ FCM notification sent successfully!
📱 FCM Response: projects/findernate-900de/messages/xxxxx
📡 Sending Socket.IO notification...
✅ Socket.IO notification sent
🔔 ========== CALL INITIATION END ==========
```

### ❌ FAILURE Patterns:

**Pattern 1: No FCM Token**
```
⚠️ SKIPPING FCM: Receiver has no FCM token
```
→ Frontend didn't save token or user never logged in on that device

**Pattern 2: Firebase Not Initialized**
```
🔥 Firebase Admin apps count: 0
🔥 Firebase Admin initialized: false
```
→ Firebase Admin SDK not initialized on server startup

**Pattern 3: Invalid Token**
```
❌ FCM send failed!
❌ Error code: messaging/invalid-registration-token
```
→ Token is from wrong Firebase project or expired

**Pattern 4: Authentication Error**
```
❌ FCM send failed!
❌ Error code: messaging/authentication-error
```
→ Service account credentials are invalid

**Pattern 5: Code Not Executing**
```
No FCM-related logs at all
```
→ FCM send code is not being reached (conditional check or wrong function)

---

## Step 4: Test FCM Directly

Create a test endpoint to verify FCM works:

**File:** `src/routes/test.routes.js`

```javascript
router.post('/test-fcm', verifyJWT, async (req, res) => {
  try {
    const { fcmToken, title, body } = req.body;
    const admin = require('firebase-admin');

    console.log('🧪 Testing FCM notification');
    console.log('📱 Token:', fcmToken);

    const message = {
      notification: { title, body },
      data: { type: 'test', timestamp: Date.now().toString() },
      token: fcmToken
    };

    const response = await admin.messaging().send(message);

    console.log('✅ Test notification sent:', response);

    res.json({
      success: true,
      message: 'FCM notification sent',
      response
    });
  } catch (error) {
    console.error('❌ Test FCM failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
});
```

Test with:
```bash
curl -X POST https://your-backend/api/v1/test-fcm \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "eNXPS7ERSxd6mt7Rvg3md6:APA91bEN4KB9OCGj1fUvf55Tq0lYQmBL9bV1-izdzsr3cWysGJ5vdNT9OODk6QsgRIgLS88QWD9zzhzkk0PtIEfF0Ij94Nk8trnNd0M1uxdkeZzg2uIE6vI",
    "title": "Test Notification",
    "body": "Testing FCM setup"
  }'
```

---

## Next Steps:

1. Add the logging code to your backend
2. Restart your backend server
3. Check server startup logs for Firebase Admin initialization
4. Initiate a call and watch the backend logs
5. Share the logs with me - I'll help you identify the exact issue!
