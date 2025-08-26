import { Post } from '@/types/admin';

export const mockPosts: Post[] = [
  {
    _id: "1",
    userId: {
      _id: "1",
      username: "john_doe",
      profileImageUrl: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
    },
    caption: "Amazing sunset at the beach! Perfect way to end the day. #sunset #beach #photography",
    contentType: "normal",
    media: [
      {
        type: "image",
        url: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg",
        thumbnailUrl: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg"
      }
    ],
    engagement: {
      likes: 234,
      comments: 45,
      shares: 12,
      views: 1200
    },
    status: "active",
    createdAt: "2024-03-20T10:30:00Z"
  },
  {
    _id: "2",
    userId: {
      _id: "2",
      username: "jane_smith",
      profileImageUrl: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
    },
    caption: "Just launched my new business! Check out our amazing products and services. #business #entrepreneur #startup",
    contentType: "business",
    media: [
      {
        type: "image",
        url: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
        thumbnailUrl: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
      }
    ],
    engagement: {
      likes: 567,
      comments: 89,
      shares: 34,
      views: 2800
    },
    status: "active",
    createdAt: "2024-03-19T14:20:00Z"
  },
  {
    _id: "3",
    userId: {
      _id: "3",
      username: "mike_wilson",
      profileImageUrl: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg"
    },
    caption: "SPAM: Buy now! Limited time offer! Click here for amazing deals! #spam #promotion",
    contentType: "normal",
    media: [
      {
        type: "image",
        url: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg",
        thumbnailUrl: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg"
      }
    ],
    engagement: {
      likes: 12,
      comments: 3,
      shares: 1,
      views: 150
    },
    status: "pending",
    createdAt: "2024-03-20T08:15:00Z"
  },
  {
    _id: "4",
    userId: {
      _id: "4",
      username: "sarah_jones",
      profileImageUrl: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
    },
    caption: "Professional photography services available! Wedding, portrait, and event photography. DM for bookings. #photography #services #professional",
    contentType: "service",
    media: [
      {
        type: "image",
        url: "https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg",
        thumbnailUrl: "https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg"
      }
    ],
    engagement: {
      likes: 890,
      comments: 156,
      shares: 67,
      views: 4500
    },
    status: "active",
    createdAt: "2024-03-18T16:45:00Z"
  },
  {
    _id: "5",
    userId: {
      _id: "5",
      username: "david_brown",
      profileImageUrl: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg"
    },
    caption: "Beautiful morning hike! The view from the top was absolutely breathtaking. #hiking #nature #morning",
    contentType: "normal",
    media: [
      {
        type: "image",
        url: "https://images.pexels.com/photos/3184294/pexels-photo-3184294.jpeg",
        thumbnailUrl: "https://images.pexels.com/photos/3184294/pexels-photo-3184294.jpeg"
      }
    ],
    engagement: {
      likes: 123,
      comments: 23,
      shares: 8,
      views: 800
    },
    status: "active",
    createdAt: "2024-03-20T07:30:00Z"
  },
  {
    _id: "6",
    userId: {
      _id: "6",
      username: "emma_davis",
      profileImageUrl: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg"
    },
    caption: "New product launch! Handcrafted jewelry made with love. Perfect gifts for your loved ones. #jewelry #handmade #gifts",
    contentType: "product",
    media: [
      {
        type: "image",
        url: "https://images.pexels.com/photos/3184295/pexels-photo-3184295.jpeg",
        thumbnailUrl: "https://images.pexels.com/photos/3184295/pexels-photo-3184295.jpeg"
      }
    ],
    engagement: {
      likes: 445,
      comments: 78,
      shares: 23,
      views: 2200
    },
    status: "active",
    createdAt: "2024-03-19T12:10:00Z"
  },
  {
    _id: "7",
    userId: {
      _id: "7",
      username: "alex_taylor",
      profileImageUrl: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
    },
    caption: "This content violates community guidelines and contains inappropriate material.",
    contentType: "normal",
    media: [
      {
        type: "image",
        url: "https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg",
        thumbnailUrl: "https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg"
      }
    ],
    engagement: {
      likes: 67,
      comments: 12,
      shares: 4,
      views: 400
    },
    status: "rejected",
    createdAt: "2024-03-17T20:30:00Z"
  },
  {
    _id: "8",
    userId: {
      _id: "8",
      username: "lisa_garcia",
      profileImageUrl: "https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg"
    },
    caption: "Delicious homemade pasta! Recipe in the comments below. #cooking #pasta #homemade #recipe",
    contentType: "normal",
    media: [
      {
        type: "image",
        url: "https://images.pexels.com/photos/3184297/pexels-photo-3184297.jpeg",
        thumbnailUrl: "https://images.pexels.com/photos/3184297/pexels-photo-3184297.jpeg"
      }
    ],
    engagement: {
      likes: 678,
      comments: 134,
      shares: 45,
      views: 3200
    },
    status: "active",
    createdAt: "2024-03-20T11:45:00Z"
  }
];