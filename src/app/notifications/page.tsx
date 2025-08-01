'use client'
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getNotifications } from '@/api/notification';
import { Bell, User, Heart, MessageCircle, FileText, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface Notification {
  _id: string;
  receiverId: string;
  senderId: {
    _id: string;
    username: string;
    profileImageUrl: string;
  } | null;
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
    message: ' started following you',
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
    message: ' liked your post',
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
    message: ' commented on your post',
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
    if (notification.type === 'follow' && notification.senderId) {
      // Navigate to the user's profile
      router.push(`/userprofile/${notification.senderId.username}`);
    }
    // You can add more conditions for other notification types here
    // For example:
    // else if (notification.type === 'like' && notification.postId) {
    //   router.push(`/post/${notification.postId}`);
    // }
  };

  const getNotificationIcon = (type: string) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'follow':
        return <User className={`${iconClass} text-blue-500`} />;
      case 'like':
        return <Heart className={`${iconClass} text-red-500 fill-current`} />;
      case 'comment':
        return <MessageCircle className={`${iconClass} text-green-500`} />;
      case 'post':
        return <FileText className={`${iconClass} text-purple-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'follow':
        return 'bg-blue-50 border-blue-200';
      case 'like':
        return 'bg-red-50 border-red-200';
      case 'comment':
        return 'bg-green-50 border-green-200';
      case 'post':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return notificationDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: notificationDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getNotifications();
        
        // Transform API response to match our interface
        // Filter out notifications with null senderId to prevent errors
        const rawNotifications = response.data?.notifications || response.data || [];
        const validNotifications = rawNotifications.filter((notification: Notification) => 
          notification && notification.senderId && notification.senderId._id
        );
        
        setNotifications(validNotifications);
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
    <div className="w-[50rem] min-h-screen mx-auto pt-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-button-gradient px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Notifications</h1>
              <p className="text-white/80 text-sm">Stay updated with your activity</p>
            </div>
          </div>
          {!loading && notifications.length > 0 && (
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">{notifications.length}</span>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-120px)]">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading notifications</h3>
            <p className="text-gray-500">Please wait while we fetch your updates...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="bg-red-100 p-4 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-500 text-center mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="bg-gray-100 p-6 rounded-full mb-6">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500 text-center">You have no new notifications right now. Check back later for updates.</p>
          </div>
        )}

        {/* Notifications List */}
        {!loading && !error && notifications.length > 0 && (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification, index) => {
              // Skip notifications with null senderId (extra safety check)
              if (!notification.senderId) {
                return null;
              }

              return (
                <div
                  key={notification._id || `notification-${index}`}
                  onClick={() => handleNotificationClick(notification)}
                  className={`relative flex items-start p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer group ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  {/* Profile Image with Status Ring */}
                  <div className="flex-shrink-0 relative">
                    <div className={`p-0.5 rounded-full ${!notification.isRead ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-200'}`}>
                      <Image
                        className="h-12 w-12 rounded-full object-cover bg-white p-0.5"
                        src={notification.senderId?.profileImageUrl || '/placeholderimg.png'}
                        alt={`${notification.senderId?.username || 'Unknown user'} profile`}
                        width={48}
                        height={48}
                      />
                    </div>
                    
                    {/* Notification type badge */}
                    <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full border-2 border-white ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 ml-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm leading-relaxed">
                          <span className="font-semibold text-gray-900 hover:text-yellow-600 transition-colors">
                            {notification.senderId?.username || 'Unknown user'}
                          </span>
                          <span className="text-gray-600">{notification.message}</span>
                        </p>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <div className="flex items-center space-x-1">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <span className="text-xs text-yellow-600 font-medium">New</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover arrow */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;