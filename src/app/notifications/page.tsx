'use client'
import Image from 'next/image';
import React, { useState } from 'react';

interface Notification {
  id: number;
  channel: string;
  profileImageUrl: string;
  videoTitle: string;
  thumbnailUrl: string;
  timestamp: string;
}

const notifications: Notification[] = [
  {
    id: 1,
    channel: 'UFC',
    profileImageUrl: '/placeholderimg.png',
    videoTitle: 'Reinier De Ridder vs Bo Nickal | FULL FIGHT | UFC Abu Dhabi',
    thumbnailUrl: '/placeholderimg.png',
    timestamp: '20 hours ago',
  },
  {
    id: 2,
    channel: 'Chai aur Code',
    profileImageUrl: '/placeholderimg.png',
    videoTitle: 'Programming language ke saath industry b pick kr loge to life easy ho jayegi',
    thumbnailUrl: '/placeholderimg.png',
    timestamp: '49 minutes ago',
  },
  {
    id: 3,
    channel: 'GFXMentor',
    profileImageUrl: '/placeholderimg.png',
    videoTitle: "How I'd Use YouTube If I Were Running Your Business",
    thumbnailUrl: '/placeholderimg.png',
    timestamp: '1 hour ago',
  },
  {
    id: 4,
    channel: 'UFC',
    profileImageUrl: '/placeholderimg.png',
    videoTitle: 'Dana White announces HUGE fight news for UFC 320 & UFC 321 🤯 #ufc',
    thumbnailUrl: '/placeholderimg.png',
    timestamp: '4 hours ago',
  },
  {
    id: 5,
    channel: 'Tech Tutorials',
    profileImageUrl: '/placeholderimg.png',
    videoTitle: 'Learn Next.js 14 in 60 minutes - Full Tutorial',
    thumbnailUrl: '/placeholderimg.png',
    timestamp: '2 days ago',
  },
];

const Notifications = () => {
  const [thumbnailErrors, setThumbnailErrors] = useState<{ [key: number]: boolean }>({});

  const handleThumbnailError = (id: number) => {
    setThumbnailErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="w-[50rem] min-h-screen overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg p-4 ml-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="flex items-start space-x-4 p-2 rounded-lg shadow-md hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
        >
          {/* Profile Image */}
          <div className="flex-shrink-0 mt-1">
            <Image
              className="h-10 w-10 rounded-full object-cover"
              src={notification.profileImageUrl || '/placeholderimg.png'}
              alt={`${notification.channel} profile`}
              width={48}
              height={48}
              onError={() => setThumbnailErrors((prev) => ({ ...prev, [notification.id]: true }))}
            />
          </div>

          {/* Notification Text and Timestamp */}
          <div className="flex-1 min-w-0">
            <p className="text-black text-sm leading-relaxed">
              <span className="font-semibold text-yellow-600">{notification.channel}</span> uploaded: {notification.videoTitle}
            </p>
            <p className="text-yellow-600 text-xs mt-1">{notification.timestamp}</p>
          </div>

          {/* Thumbnail */}
          <div className="flex items-center space-x-2 ml-4">
            <Image
              className="w-18 h-auto object-cover rounded-md hidden sm:block"
              src={
                thumbnailErrors[notification.id]
                  ? '/placeholderimg.png'
                  : notification.thumbnailUrl
              }
              alt="Video thumbnail"
              width={90}
              height={68}
              onError={() => handleThumbnailError(notification.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
