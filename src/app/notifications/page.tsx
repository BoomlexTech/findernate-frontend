'use client'
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getNotifications } from '@/api/notification';

interface Notification {
  _id: string;
  receiverId: string;
  senderId: {
    _id: string;
    username: string;
    profileImageUrl: string;
  };
  type: string;
  message: string;
  postId: string | null;
  commentId: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// Fallback data in case API fails
const fallbackNotifications: Notification[] = [
  {
    _id: '1',
    receiverId: 'user1',
    senderId: {
      _id: 'sender1',
      username: 'UFC',
      profileImageUrl: '/placeholderimg.png',
    },
    type: 'follow',
    message: 'Someone started following you',
    postId: null,
    commentId: null,
    isRead: false,
    createdAt: '2025-07-28T05:54:03.435Z',
    updatedAt: '2025-07-28T05:54:03.435Z',
  },
  {
    _id: '2',
    receiverId: 'user1',
    senderId: {
      _id: 'sender2',
      username: 'Chai aur Code',
      profileImageUrl: '/placeholderimg.png',
    },
    type: 'like',
    message: 'Someone liked your post',
    postId: 'post1',
    commentId: null,
    isRead: false,
    createdAt: '2025-07-28T04:30:00.000Z',
    updatedAt: '2025-07-28T04:30:00.000Z',
  },
  {
    _id: '3',
    receiverId: 'user1',
    senderId: {
      _id: 'sender3',
      username: 'GFXMentor',
      profileImageUrl: '/placeholderimg.png',
    },
    type: 'comment',
    message: 'Someone commented on your post',
    postId: 'post2',
    commentId: 'comment1',
    isRead: false,
    createdAt: '2025-07-28T03:15:00.000Z',
    updatedAt: '2025-07-28T03:15:00.000Z',
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'follow') {
      // Navigate to the user's profile
      router.push(`/userprofile/${notification.senderId.username}`);
    }
    // You can add more conditions for other notification types here
    // For example:
    // else if (notification.type === 'like' && notification.postId) {
    //   router.push(`/post/${notification.postId}`);
    // }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getNotifications();
        
        // Transform API response to match our interface
        // Adjust this based on your actual API response structure
        const transformedNotifications = response.data?.notifications || response.data || [];
        
        setNotifications(transformedNotifications);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        setError('Failed to load notifications');
        // Use fallback data if API fails
        setNotifications(fallbackNotifications);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="w-[50rem] min-h-screen overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg p-4 ml-50 space-y-2">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          <span className="ml-3 text-gray-600">Loading notifications...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Notifications List */}
      {!loading && !error && notifications.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Notifications</h2>
          <p className="text-gray-600">You&apos;re all caught up! Check back later for new updates.</p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && notifications.map((notification, index) => (
        <div
          key={notification._id || `notification-${index}`}
          onClick={() => handleNotificationClick(notification)}
          className={`flex items-start space-x-4 p-2 rounded-lg shadow-md hover:bg-gray-200 transition-colors duration-200 cursor-pointer ${
            !notification.isRead ? 'bg-blue-50 border-l-4 border-yellow-500' : ''
          }`}
        >
          {/* Profile Image */}
          <div className="flex-shrink-0 mt-1">
            <Image
              className="h-10 w-10 rounded-full object-cover"
              src={notification.senderId.profileImageUrl || '/placeholderimg.png'}
              alt={`${notification.senderId.username} profile`}
              width={48}
              height={48}
            />
          </div>

          {/* Notification Text and Timestamp */}
          <div className="flex-1 min-w-0">
            <p className="text-black text-sm leading-relaxed">
              <span className="font-semibold text-yellow-600">{notification.senderId.username}</span> {notification.message}
            </p>
            <p className="text-yellow-600 text-xs mt-1">
              {new Date(notification.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Notification Type Icon */}
          <div className="flex items-center space-x-2 ml-4">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              {notification.type === 'follow' && <span className="text-yellow-600 text-xs">👥</span>}
              {notification.type === 'like' && <span className="text-yellow-600 text-xs">❤️</span>}
              {notification.type === 'comment' && <span className="text-yellow-600 text-xs">💬</span>}
              {notification.type === 'post' && <span className="text-yellow-600 text-xs">📝</span>}
              {!['follow', 'like', 'comment', 'post'].includes(notification.type) && <span className="text-yellow-600 text-xs">🔔</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
