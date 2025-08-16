# Push Notifications Implementation

This document explains how web push notifications have been implemented for messages in the FinderNate app.

## 📋 Overview

The push notification system allows users to receive real-time notifications when they receive new messages, even when the app is closed or in the background.

## 🏗️ Architecture

### Components Created

1. **Service Worker** (`/public/sw.js`)
   - Handles push events and displays notifications
   - Manages notification clicks and user interactions

2. **Push Notification Utilities** (`/src/utils/pushNotifications.ts`)
   - Core functionality for managing push subscriptions
   - VAPID key handling and browser compatibility checks

3. **React Hook** (`/src/hooks/usePushNotifications.ts`)
   - Provides easy interface for React components
   - Manages state and error handling

4. **Settings Component** (`/src/components/notifications/NotificationSettings.tsx`)
   - UI for enabling/disabling push notifications
   - Permission status and error display

5. **Provider Component** (`/src/components/providers/PushNotificationProvider.tsx`)
   - Global setup and initialization
   - Integrates with app layout

## 🚀 Setup Instructions

### 1. Generate VAPID Keys

```bash
npm install -g web-push
web-push generate-vapid-keys
```

### 2. Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

### 3. Backend Integration (Required)

You need to implement these backend endpoints:

#### POST `/api/push/subscribe`
```javascript
// Save user's push subscription
{
  "subscription": {
    "endpoint": "...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

#### POST `/api/push/unsubscribe`
```javascript
// Remove user's push subscription
{
  "subscription": { /* same format */ }
}
```

#### Push Notification Sending
When a new message is created, send push notification:

```javascript
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:your-email@domain.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Send to all subscribed users
const payload = JSON.stringify({
  title: `New message from ${senderName}`,
  body: messageContent,
  chatId: message.chatId,
  messageId: message._id,
  senderId: message.sender._id,
  url: `/messages?chat=${message.chatId}`
});

await webpush.sendNotification(userSubscription, payload);
```

## 🔧 Features

### ✅ Implemented Features

- **Service Worker Registration**: Automatic registration and updates
- **Permission Management**: Request and handle notification permissions
- **Push Subscription**: Subscribe/unsubscribe from push notifications
- **Local Notifications**: Show notifications when app is in background
- **Notification Clicks**: Navigate to specific chat when notification clicked
- **Settings UI**: Easy toggle for enabling/disabling notifications
- **Error Handling**: Comprehensive error states and user feedback
- **Browser Compatibility**: Checks for push notification support
- **Caching**: LocalStorage for managing subscription state

### 🔄 Integration Points

1. **Message Receiving**: 
   ```javascript
   import { handleIncomingMessage } from '@/api/message';
   
   // In your WebSocket/real-time message handler
   socket.on('newMessage', (message) => {
     handleIncomingMessage(message, currentUserId);
   });
   ```

2. **User Authentication**:
   - Push notifications are automatically initialized when user logs in
   - Subscription is tied to user authentication state

3. **Settings Page**:
   - Added NotificationSettings component to `/notifications` page
   - Users can enable/disable push notifications

## 📱 User Experience

### First Time Setup
1. User navigates to notifications page
2. Sees "Enable Notifications" button
3. Clicks button → browser shows permission prompt
4. If granted → automatically subscribes to push notifications
5. Settings show "Notifications Enabled" with option to disable

### Receiving Notifications
1. User receives message while app is closed/background
2. Push notification appears with sender name and message preview
3. User clicks notification → app opens to specific chat
4. If app is already open and focused → no notification shown (prevents spam)

### Managing Notifications
1. Go to notifications page
2. Toggle "Disable Notifications" to unsubscribe
3. If browser blocks notifications → helpful instructions shown

## 🔒 Privacy & Security

- **User Consent**: Notifications only work after explicit user permission
- **No Personal Data**: Push subscriptions don't contain personal information
- **Secure Communication**: Uses VAPID keys for authenticated push messages
- **Graceful Degradation**: App works normally if notifications are disabled

## 🐛 Troubleshooting

### Common Issues

1. **"Not Supported" Message**
   - User's browser doesn't support push notifications
   - Happens in some mobile browsers and older browsers

2. **"Blocked" Status**
   - User previously denied notification permission
   - Need to reset in browser settings

3. **Notifications Not Appearing**
   - Check if backend is sending push notifications
   - Verify VAPID keys are correct
   - Check browser's notification settings

### Testing

1. **Local Testing**:
   ```javascript
   import { pushNotificationManager } from '@/utils/pushNotifications';
   
   // Test local notification
   pushNotificationManager.showLocalNotification({
     title: 'Test Message',
     body: 'This is a test notification',
     chatId: 'test-chat',
     messageId: 'test-message',
     senderId: 'test-sender',
     senderName: 'Test User'
   });
   ```

2. **Service Worker Testing**:
   - Open DevTools → Application → Service Workers
   - Check if service worker is registered and running
   - Use "Push" button to simulate push events

## 🔮 Future Enhancements

1. **Rich Notifications**: Add images and action buttons
2. **Notification Grouping**: Group multiple messages from same chat
3. **Custom Sounds**: Different sounds for different notification types
4. **Notification Scheduling**: Respect user's quiet hours
5. **Badge Count**: Show unread count on app icon

## 📚 Dependencies

- **Web Push API**: Browser native push notification support
- **Service Worker API**: Background script execution
- **React Hooks**: State management and lifecycle
- **LocalStorage**: Persistence of user preferences

## 🤝 Contributing

When adding new notification types:

1. Update the `MessageNotificationData` interface
2. Add new notification handling in service worker
3. Create appropriate notification content in `createMessageNotification`
4. Test across different browsers and devices

---

**Note**: This implementation focuses on message notifications. The architecture can be extended to support other types of notifications (likes, comments, follows) by following the same patterns.