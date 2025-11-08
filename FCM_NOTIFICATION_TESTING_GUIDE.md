# FCM Notification Testing Guide

## ✅ What Was Fixed

Your FCM notification system for incoming calls has been updated with the following improvements:

### 1. Enhanced Service Worker (`firebase-messaging-sw.js`)
- ✅ Better logging for debugging
- ✅ Handles multiple payload formats from backend
- ✅ Proper notification action buttons (Accept/Decline)
- ✅ Improved notification click handling
- ✅ Better caller image and notification icon handling

### 2. Debug Utilities (`notificationDebug.ts`)
- ✅ Browser console helpers for testing
- ✅ Automatic permission status checking
- ✅ Service worker registration verification
- ✅ Test notification generator

---

## 🧪 How to Test FCM Notifications

### Step 1: Check Current Status

Open your browser's Developer Console (F12) and run:

```javascript
window.checkNotificationStatus()
```

This will show you:
- ✅ Browser notification support
- 🔐 Current notification permission
- 📝 Service worker registrations
- ⚙️ Firebase configuration status

**Expected Output:**
```
✅ Browser supports notifications: true
✅ Notification permission is GRANTED
✅ Browser supports Service Workers: true
📝 Found 1 service worker registration(s)
✅ Everything looks good! FCM notifications should work.
```

---

### Step 2: Request Notification Permission (if needed)

If notification permission is **NOT** granted, run:

```javascript
window.requestNotificationPermission()
```

Or use the built-in browser prompt:

```javascript
await Notification.requestPermission()
```

**Important:** If permission was previously **denied**, the user must manually reset it in browser settings:
- **Chrome:** Settings > Privacy > Site Settings > Notifications > findernate.com > Allow
- **Firefox:** Settings > Privacy > Permissions > Notifications > Settings > findernate.com > Allow
- **Safari:** Preferences > Websites > Notifications > findernate.com > Allow

---

### Step 3: Test Local Notification

Test if browser notifications work with a simulated call notification:

```javascript
window.testFCMNotification()
```

This will show a test notification with:
- 📞 Call title and body
- 🖼️ FinderNate icon
- 🔔 Vibration pattern
- ⏰ Persistent notification (requireInteraction: true)

**Expected:** You should see a notification appear with "Test Call Notification"

---

### Step 4: Test Real FCM Notification

#### A. Using Your App (End-to-End Test)

1. **Open the app on Device A** (as User 1)
2. **Open the app on Device B** (as User 2)
3. **Make a call from Device A to Device B**
4. **Expected Results on Device B:**
   - ✅ Socket receives incoming call event
   - ✅ FCM receives background message (if app in background/closed)
   - ✅ Notification appears with Accept/Decline buttons
   - ✅ Clicking Accept opens the app and joins the call
   - ✅ Clicking Decline rejects the call

#### B. Check Browser Console Logs

When a call comes in, you should see these logs:

**In Main App:**
```
📞 Incoming call received via Socket: {...}
📞 Incoming call received via FCM: {...}
```

**In Service Worker Console:**

To see service worker logs:
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers**
4. Check "Show console messages from service workers"
5. Or click "inspect" next to the service worker

Expected logs:
```
📬 [FCM Background] Message received: {...}
📬 [FCM Background] Notification type: incoming_call
📬 [FCM Background] Adding call action buttons
📬 [FCM Background] Showing notification with options: {...}
```

---

## 🔍 Debugging Tips

### Problem: No notifications appearing

**Check 1: Notification Permission**
```javascript
Notification.permission  // Should return "granted"
```

**Check 2: Service Worker Active**
```javascript
window.getServiceWorkerInfo()
```

**Check 3: FCM Token**
```javascript
// Check if token was generated and sent to backend
localStorage.getItem('fcmToken')

// Or regenerate token
await window.regenerateFCMToken()
```

### Problem: Service worker not registered

**Solution: Unregister and re-register**
```javascript
// Unregister all service workers
window.unregisterAllServiceWorkers()

// Refresh the page (this will re-register the service worker)
location.reload()
```

### Problem: Notifications appear but buttons don't work

**Check:** Make sure GlobalCallProvider is listening for service worker messages

Look for this log when clicking Accept/Decline:
```
🔔 [FCM] Notification clicked: accept_call
📞 [FCM] Accept call clicked for callId: ...
📞 [FCM] Sending ACCEPT_CALL message to existing window
```

---

## 📱 Testing Scenarios

### Scenario 1: App in Foreground
- **Expected:** IncomingCallModal appears immediately via Socket/FCM foreground message
- **Test:** Have someone call you while the app is open

### Scenario 2: App in Background (tab open but not focused)
- **Expected:** Browser notification appears with Accept/Decline buttons
- **Test:** Open app in a tab, switch to another tab, have someone call you

### Scenario 3: App Closed (browser closed)
- **Expected:** Browser notification appears (requires app to be a PWA and service worker registered)
- **Test:** Close browser completely, have someone call you (this may not work on all browsers/devices)

### Scenario 4: Mobile Device (PWA Installed)
- **Expected:** System notification appears even when app is closed
- **Test:** Install app as PWA, close it, have someone call you

---

## 🔧 Service Worker Management

### View All Service Workers
```javascript
window.getServiceWorkerInfo()
```

### Manually Register Service Worker
```javascript
navigator.serviceWorker.register('/firebase-messaging-sw.js')
  .then(reg => console.log('✅ Registered:', reg.scope))
  .catch(err => console.error('❌ Failed:', err))
```

### Check Active Service Worker
```javascript
navigator.serviceWorker.ready.then(reg => {
  console.log('Active SW:', reg.active?.scriptURL)
})
```

### Force Update Service Worker
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.update())
  console.log('✅ Service workers updated')
})
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Firebase Messaging not supported in this browser"

**Cause:** Browser doesn't support FCM (Safari < 16.4, older browsers)

**Solution:**
- Use Chrome, Firefox, or Edge (latest versions)
- Update Safari to 16.4+ for iOS/macOS support

---

### Issue 2: "Notification permission denied"

**Cause:** User previously denied permission or blocked notifications

**Solution:**
1. Open browser settings
2. Find Notifications or Site Settings
3. Allow notifications for your domain
4. Refresh the page
5. Run `window.requestNotificationPermission()`

---

### Issue 3: Duplicate notifications

**Cause:** Both socket and FCM triggering notifications

**Current Setup:**
- ✅ Socket is primary for foreground
- ✅ FCM is primary for background
- ✅ Both should work together without duplicates

**If you see duplicates:**
- Check GlobalCallProvider - it should handle both gracefully
- Check that you're not showing notifications manually when FCM already shows them

---

### Issue 4: Notifications not appearing in background

**Cause:** Service worker not handling background messages

**Check:**
1. Service worker registered: `window.getServiceWorkerInfo()`
2. FCM token generated: `localStorage.getItem('fcmToken')`
3. Backend sending correct payload format

**Backend Payload Format:**

Your backend should send FCM messages like this:

```json
{
  "notification": {
    "title": "Incoming Call from John Doe",
    "body": "Voice Call"
  },
  "data": {
    "type": "incoming_call",
    "callId": "690ec90961af7b56569b4d03",
    "chatId": "690592d071073491245f237d",
    "callerId": "68e4a6f1d37e032b58aa7cf5",
    "callerName": "John Doe",
    "callerImage": "https://example.com/avatar.jpg",
    "callType": "voice"
  },
  "fcmToken": "user-fcm-token-here"
}
```

---

## 📊 Expected Console Logs

### When app starts:
```
💡 Notification Debug Utils loaded! Available commands:
   • window.checkNotificationStatus()
   • window.testFCMNotification()
   • window.requestNotificationPermission()
   • window.getServiceWorkerInfo()
   • window.unregisterAllServiceWorkers()
```

### When incoming call arrives (Foreground):
```
📞 Incoming call received via Socket: {...}
📞 Incoming call received via FCM: {...}
```

### When incoming call arrives (Background):
```
📬 [FCM Background] Message received: {...}
📬 [FCM Background] Payload data: {...}
📬 [FCM Background] Notification type: incoming_call
📬 [FCM Background] Adding call action buttons
📬 [FCM Background] Showing notification with options: {...}
```

### When notification clicked:
```
🔔 [FCM] Notification clicked: accept_call
📞 [FCM] Accept call clicked for callId: 690ec90961af7b56569b4d03
📞 [FCM] Found 1 client windows
📞 [FCM] Sending ACCEPT_CALL message to existing window
📞 Accept call from notification: {...}
```

---

## ✅ Final Checklist

Before reporting issues, verify:

- [ ] ✅ Notification permission is granted: `Notification.permission === "granted"`
- [ ] ✅ Service worker registered: `window.getServiceWorkerInfo()` shows firebase-messaging-sw.js
- [ ] ✅ FCM token generated and saved: `localStorage.getItem('fcmToken')` is not null
- [ ] ✅ Firebase config complete: All `NEXT_PUBLIC_FIREBASE_*` env vars set
- [ ] ✅ Test notification works: `window.testFCMNotification()` shows notification
- [ ] ✅ Console shows no errors related to FCM or service workers
- [ ] ✅ Backend is sending FCM notifications (check backend logs)
- [ ] ✅ User's FCM token is stored in backend database

---

## 🎯 Quick Test Commands

Copy and paste these into your browser console:

```javascript
// 1. Check everything is working
window.checkNotificationStatus()

// 2. Request permission if needed
await window.requestNotificationPermission()

// 3. Test a notification
window.testFCMNotification()

// 4. Check service worker
window.getServiceWorkerInfo()

// 5. Regenerate FCM token
await window.regenerateFCMToken()
```

---

## 📞 Need More Help?

If notifications still don't work after following this guide:

1. **Collect logs:**
   - Browser console logs
   - Service worker console logs
   - Backend FCM sending logs

2. **Check backend:**
   - Is FCM token being sent correctly?
   - Is backend using correct FCM server key?
   - Is payload format correct?

3. **Test with curl:**
```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "USER_FCM_TOKEN",
    "notification": {
      "title": "Test Call",
      "body": "This is a test"
    },
    "data": {
      "type": "incoming_call",
      "callId": "test-123"
    }
  }'
```

---

**Last Updated:** 2025-01-08
**Version:** 2.0
**Status:** ✅ Ready for Testing