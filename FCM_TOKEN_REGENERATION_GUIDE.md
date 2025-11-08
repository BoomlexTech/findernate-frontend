# FCM Token Regeneration Guide

## ✅ Implemented Features

I've added FCM token regeneration functionality to your frontend. This allows you to delete old FCM tokens and generate fresh ones.

---

## 🎯 3 Ways to Regenerate FCM Token

### Method 1: Using the UI Button (Easiest)

1. Navigate to the page where `EnvDebug` component is rendered
2. Look for the **"FCM Debug & Token Management"** section
3. Click the **"🔄 Regenerate FCM Token"** button
4. Wait for the success message
5. Try making a call to test!

**What happens:**
- Deletes old FCM token from Firebase
- Generates a new FCM token
- Automatically saves the new token to backend
- Shows success/failure message

---

### Method 2: Browser Console (For Testing)

Open browser console (F12) and run:

```javascript
// Regenerate token
window.regenerateFCMToken()
```

**Console Output:**
```
🔄 Starting FCM token regeneration...
🗑️ Old FCM token deleted successfully
🔐 Generating new FCM token...
✅ New FCM token generated: eNXPS7ERSxd6mt7Rvg...
📤 Saving new token to backend...
✅ New FCM token saved to backend successfully!
```

---

### Method 3: Programmatically in Code

```typescript
import { regenerateFCMToken } from '@/config/firebase';

// In any component or function
const handleTokenRegeneration = async () => {
  const newToken = await regenerateFCMToken();
  if (newToken) {
    console.log('Success! New token:', newToken);
  } else {
    console.error('Failed to regenerate token');
  }
};
```

---

## 📋 When to Regenerate FCM Token

You should regenerate your FCM token if:

1. ✅ You're not receiving call notifications
2. ✅ Backend reports "invalid token" errors
3. ✅ You switched Firebase projects
4. ✅ Token has expired or been revoked
5. ✅ Testing notification functionality

---

## 🔍 What the Function Does

### Step-by-Step Process:

1. **Checks browser support**
   - Verifies notifications are supported
   - Verifies service workers are supported

2. **Requests notification permission**
   - Prompts user if permission not granted
   - Stops if user denies permission

3. **Deletes old token**
   - Removes existing FCM token from Firebase
   - Safe if no token exists

4. **Generates new token**
   - Creates fresh FCM token with VAPID key
   - Registers service worker
   - Gets token from Firebase

5. **Saves to backend**
   - Sends new token to `/api/v1/users/fcm-token`
   - Uses your JWT token for authentication
   - Updates user's FCM token in database

---

## 🧪 Testing the Regeneration

### Test Flow:

1. **Before Regeneration:**
```javascript
// In console
window.regenerateFCMToken()
```

2. **Watch the logs:**
- Check console for success messages
- Check Network tab for API call to backend
- Verify backend response is 200 OK

3. **Verify on Backend:**
Backend should log:
```
📱 Receiver FCM token exists: true
📱 Receiver FCM token value: [new token]
```

4. **Test Call:**
- Have someone call you
- Check if FCM notification arrives
- Should see in console: "Foreground message received"

---

## ⚠️ Troubleshooting

### Issue: "Notification permission denied"
**Solution:** Allow notifications in browser settings
```
Chrome: Settings → Privacy → Site Settings → Notifications
```

### Issue: "Service Worker registration failed"
**Solution:**
- Check that `/firebase-messaging-sw.js` exists
- Verify VAPID key is configured in `.env.local`
- Check browser console for SW errors

### Issue: "Failed to save token to backend"
**Solution:**
- Check if you're logged in (JWT token exists)
- Verify backend endpoint `/api/v1/users/fcm-token` is working
- Check Network tab for error details

### Issue: "Token regenerated but still no notifications"
**Possible causes:**
1. Backend is not sending FCM notifications (check backend logs)
2. Firebase Admin SDK not initialized on backend
3. Backend using wrong Firebase project credentials

---

## 🎯 Quick Verification Checklist

After regenerating token, verify:

- [ ] Console shows "✅ New FCM token generated"
- [ ] Console shows "✅ New FCM token saved to backend"
- [ ] Network tab shows 200 OK from `/users/fcm-token`
- [ ] Backend database has new token saved
- [ ] Backend logs show token when initiating call
- [ ] Backend logs show "✅ FCM notification sent successfully"
- [ ] Frontend receives FCM notification

---

## 📱 Console Commands Reference

```javascript
// Regenerate FCM token
window.regenerateFCMToken()

// The function returns the new token
const token = await window.regenerateFCMToken()
console.log('New token:', token)
```

---

## 🔗 Related Files

- **Token regeneration logic:** `src/config/firebase.ts` (line 123-219)
- **UI component:** `src/components/debug/EnvDebug.tsx`
- **Backend endpoint:** Backend `/api/v1/users/fcm-token` (POST)
- **Service worker:** `public/firebase-messaging-sw.js`

---

## 💡 Pro Tips

1. **Development:** Use console method for quick testing
2. **Production:** Use UI button for user-friendly regeneration
3. **Debugging:** Check both frontend console AND backend logs
4. **Testing:** Regenerate token, then immediately test with a call

---

## Next Steps

After regenerating token:

1. ✅ Verify token saved to backend
2. ✅ Add backend logging (see BACKEND_FCM_DEBUG_GUIDE.md)
3. ✅ Test call notifications
4. ✅ Check backend logs for FCM send status

If notifications still don't work after regeneration, the issue is on the **backend** (not sending FCM).
