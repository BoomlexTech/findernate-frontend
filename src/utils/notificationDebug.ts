/**
 * Notification Debug Utilities
 *
 * Helper functions for checking and debugging FCM notifications
 *
 * Usage in browser console:
 * - window.checkNotificationStatus()
 * - window.testFCMNotification()
 */

export const checkNotificationStatus = () => {
  console.log('\n📋 === NOTIFICATION STATUS CHECK ===\n');

  // 1. Check if browser supports notifications
  const notificationSupport = 'Notification' in window;
  console.log('✅ Browser supports notifications:', notificationSupport);

  if (!notificationSupport) {
    console.error('❌ This browser does NOT support notifications');
    return {
      supported: false,
      permission: null,
      serviceWorkerRegistered: false,
      fcmToken: null
    };
  }

  // 2. Check notification permission
  const permission = Notification.permission;
  console.log('🔐 Notification Permission:', permission);

  if (permission === 'granted') {
    console.log('✅ Notification permission is GRANTED');
  } else if (permission === 'denied') {
    console.error('❌ Notification permission is DENIED - User must reset in browser settings');
  } else {
    console.warn('⚠️ Notification permission not yet requested (default state)');
  }

  // 3. Check Service Worker support
  const swSupport = 'serviceWorker' in navigator;
  console.log('✅ Browser supports Service Workers:', swSupport);

  // 4. Check Service Worker registration
  if (swSupport) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log(`📝 Found ${registrations.length} service worker registration(s):`);

      registrations.forEach((reg, index) => {
        console.log(`  ${index + 1}. Scope: ${reg.scope}`);
        console.log(`     Active: ${reg.active?.scriptURL || 'None'}`);
        console.log(`     Waiting: ${reg.waiting?.scriptURL || 'None'}`);
        console.log(`     Installing: ${reg.installing?.scriptURL || 'None'}`);
      });

      if (registrations.length === 0) {
        console.warn('⚠️ No service workers registered yet');
      }
    });
  }

  // 5. Check FCM token in localStorage (if saved)
  const fcmToken = localStorage.getItem('fcmToken');
  console.log('🔑 FCM Token in localStorage:', fcmToken ? `${fcmToken.substring(0, 30)}...` : 'Not found');

  // 6. Check Firebase config
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing',
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ? '✅ Set' : '❌ Missing'
  };

  console.log('⚙️ Firebase Configuration:');
  Object.entries(firebaseConfig).forEach(([key, value]) => {
    console.log(`   ${value} ${key}`);
  });

  // 7. Summary
  console.log('\n📊 === SUMMARY ===');
  const allGood = notificationSupport &&
                  permission === 'granted' &&
                  swSupport &&
                  firebaseConfig.vapidKey === '✅ Set';

  if (allGood) {
    console.log('✅ Everything looks good! FCM notifications should work.');
  } else {
    console.log('⚠️ Some issues found. Check the details above.');
  }

  console.log('\n💡 Next steps:');
  if (permission !== 'granted') {
    console.log('   1. Request notification permission: await Notification.requestPermission()');
  }
  if (firebaseConfig.vapidKey !== '✅ Set') {
    console.log('   2. Add NEXT_PUBLIC_FIREBASE_VAPID_KEY to your .env file');
  }
  console.log('   3. Test a call to see if notifications appear\n');

  return {
    supported: notificationSupport,
    permission,
    serviceWorkerRegistered: swSupport,
    firebaseConfigured: firebaseConfig.vapidKey === '✅ Set'
  };
};

/**
 * Test function to simulate a local notification
 */
export const testFCMNotification = async () => {
  console.log('🧪 Testing local notification...');

  if (!('Notification' in window)) {
    console.error('❌ Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.log('🔐 Requesting notification permission...');
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.error('❌ Notification permission denied');
      return;
    }
  }

  console.log('✅ Showing test notification...');

  const notificationOptions: NotificationOptions & { vibrate?: number[] } = {
    body: 'This is a test incoming call from John Doe',
    icon: '/Findernate.ico',
    badge: '/Findernate.ico',
    tag: 'test-call',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      callId: 'test-123',
      callerId: 'user-123',
      callerName: 'John Doe',
      chatId: 'chat-123',
      callType: 'voice',
      type: 'incoming_call'
    }
  };

  const notification = new Notification('Test Call Notification', notificationOptions);

  notification.onclick = () => {
    console.log('📞 Test notification clicked!');
    notification.close();
  };

  console.log('✅ Test notification shown!');
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.error('❌ Notifications not supported in this browser');
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    console.log('✅ Notification permission already granted');
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    console.error('❌ Notification permission was denied. User must reset in browser settings:');
    console.log('   Chrome: Settings > Privacy > Site Settings > Notifications');
    console.log('   Firefox: Settings > Privacy > Permissions > Notifications > Settings');
    console.log('   Safari: Preferences > Websites > Notifications');
    return 'denied';
  }

  console.log('🔐 Requesting notification permission...');
  const permission = await Notification.requestPermission();

  if (permission === 'granted') {
    console.log('✅ Notification permission granted!');
  } else {
    console.error('❌ Notification permission denied');
  }

  return permission;
};

/**
 * Get Service Worker registration info
 */
export const getServiceWorkerInfo = async () => {
  if (!('serviceWorker' in navigator)) {
    console.error('❌ Service Workers not supported');
    return null;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();

  console.log('\n🔧 === SERVICE WORKER INFO ===\n');
  console.log(`Found ${registrations.length} registration(s):`);

  registrations.forEach((reg, index) => {
    console.log(`\n${index + 1}. Registration:`);
    console.log(`   Scope: ${reg.scope}`);
    console.log(`   Active: ${reg.active?.scriptURL || 'None'}`);
    console.log(`   State: ${reg.active?.state || 'N/A'}`);
    console.log(`   Waiting: ${reg.waiting?.scriptURL || 'None'}`);
    console.log(`   Installing: ${reg.installing?.scriptURL || 'None'}`);
  });

  return registrations;
};

/**
 * Unregister all service workers (useful for debugging)
 */
export const unregisterAllServiceWorkers = async () => {
  if (!('serviceWorker' in navigator)) {
    console.error('❌ Service Workers not supported');
    return;
  }

  console.log('🧹 Unregistering all service workers...');
  const registrations = await navigator.serviceWorker.getRegistrations();

  for (const registration of registrations) {
    const success = await registration.unregister();
    console.log(`${success ? '✅' : '❌'} Unregistered: ${registration.scope}`);
  }

  console.log('✅ All service workers unregistered. Refresh the page to re-register.');
};

// Make functions globally available in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).checkNotificationStatus = checkNotificationStatus;
  (window as any).testFCMNotification = testFCMNotification;
  (window as any).requestNotificationPermission = requestNotificationPermission;
  (window as any).getServiceWorkerInfo = getServiceWorkerInfo;
  (window as any).unregisterAllServiceWorkers = unregisterAllServiceWorkers;

  console.log('💡 Notification Debug Utils loaded! Available commands:');
  console.log('   • window.checkNotificationStatus()');
  console.log('   • window.testFCMNotification()');
  console.log('   • window.requestNotificationPermission()');
  console.log('   • window.getServiceWorkerInfo()');
  console.log('   • window.unregisterAllServiceWorkers()');
}
