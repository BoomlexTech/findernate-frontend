# Firebase Configuration Verification

## Frontend Configuration

### .env.local Firebase Settings:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBS2VB9h0FHBhs93ucROiy9nzAcgdiA7Bo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=findernate-900de.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=findernate-900de
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=findernate-900de.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=902240921355
NEXT_PUBLIC_FIREBASE_APP_ID=1:902240921355:web:b11f85d182914bb20ce40e
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BJGNMU5VdpbX_QPE_jftqlh1CO5EjeaxON1XMackvv_IoRDIktcX5FDVQaazq10a6x5qd2Wr_GQgcYFm0JppT5w
```

### Service Worker (firebase-messaging-sw.js):
```javascript
projectId: "findernate-900de"
messagingSenderId: "902240921355"
appId: "1:902240921355:web:b11f85d182914bb20ce40e"
```

## ✅ Frontend Configuration Status:
- [x] Project ID: `findernate-900de`
- [x] Messaging Sender ID: `902240921355`
- [x] App ID: `1:902240921355:web:b11f85d182914bb20ce40e`
- [x] VAPID Key: Configured
- [x] Service Worker Config: Matches .env.local

## Backend Requirements:

The backend must have Firebase Admin SDK configured with:

### Required Backend Environment Variables:
```bash
FIREBASE_PROJECT_ID=findernate-900de
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@findernate-900de.iam.gserviceaccount.com
```

## ⚠️ Important Checks:

### 1. Verify Backend Firebase Project ID:
The backend's FIREBASE_PROJECT_ID must be: **findernate-900de**

### 2. Verify Backend Service Account:
The Firebase Admin service account credentials must be from the **same Firebase project** (findernate-900de).

To verify on backend:
```javascript
console.log('Backend Firebase Project:', admin.app().options.projectId);
```

Expected output: `findernate-900de`

### 3. Check Backend Service Account Email:
The service account email should be: `firebase-adminsdk-*@findernate-900de.iam.gserviceaccount.com`

**NOT** from a different project like:
- firebase-adminsdk-*@other-project.iam.gserviceaccount.com ❌

## How to Get Correct Service Account Credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **findernate-900de**
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Extract these values for backend .env:
   - `project_id` → FIREBASE_PROJECT_ID
   - `private_key` → FIREBASE_PRIVATE_KEY
   - `client_email` → FIREBASE_CLIENT_EMAIL

## Testing FCM Token:

After ensuring backend has correct credentials, test with:
```bash
curl -X POST https://your-backend-api.com/api/v1/test-fcm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "fcmToken": "YOUR_FCM_TOKEN_HERE",
    "title": "Test Notification",
    "body": "Testing FCM setup"
  }'
```

## Summary:

✅ Frontend is correctly configured for project: **findernate-900de**
⚠️ Backend must use Firebase Admin SDK credentials from: **findernate-900de**

If tokens are still being rejected, the backend is using credentials from a DIFFERENT Firebase project.
