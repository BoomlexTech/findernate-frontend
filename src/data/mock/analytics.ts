import { AnalyticsData } from '@/types/admin';

export const mockAnalyticsData: AnalyticsData = {
  userGrowth: [
    { date: "2024-01-01", users: 1200 },
    { date: "2024-01-15", users: 1350 },
    { date: "2024-02-01", users: 1500 },
    { date: "2024-02-15", users: 1680 },
    { date: "2024-03-01", users: 1850 },
    { date: "2024-03-15", users: 2100 },
    { date: "2024-03-20", users: 2250 }
  ],
  contentCreation: [
    { date: "2024-01-01", posts: 45, comments: 120 },
    { date: "2024-01-15", posts: 52, comments: 145 },
    { date: "2024-02-01", posts: 61, comments: 180 },
    { date: "2024-02-15", posts: 68, comments: 210 },
    { date: "2024-03-01", posts: 75, comments: 245 },
    { date: "2024-03-15", posts: 82, comments: 280 },
    { date: "2024-03-20", posts: 89, comments: 310 }
  ],
  engagementRate: [
    { date: "2024-01-01", rate: 3.2 },
    { date: "2024-01-15", rate: 3.5 },
    { date: "2024-02-01", rate: 3.8 },
    { date: "2024-02-15", rate: 4.1 },
    { date: "2024-03-01", rate: 4.3 },
    { date: "2024-03-15", rate: 4.6 },
    { date: "2024-03-20", rate: 4.8 }
  ],
  categoryDistribution: [
    { category: "Photography", count: 156 },
    { category: "Technology", count: 89 },
    { category: "Fashion & Jewelry", count: 134 },
    { category: "Food & Beverage", count: 245 },
    { category: "Health & Fitness", count: 78 },
    { category: "Design & Creative", count: 112 },
    { category: "Travel & Tourism", count: 67 },
    { category: "Other", count: 189 }
  ],
  topPosts: [
    {
      _id: "4",
      userId: {
        _id: "4",
        username: "sarah_jones",
        profileImageUrl: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
      },
      caption: "Professional photography services available! Wedding, portrait, and event photography. DM for bookings.",
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
      _id: "8",
      userId: {
        _id: "8",
        username: "lisa_garcia",
        profileImageUrl: "https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg"
      },
      caption: "Delicious homemade pasta! Recipe in the comments below.",
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
    },
    {
      _id: "2",
      userId: {
        _id: "2",
        username: "jane_smith",
        profileImageUrl: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
      },
      caption: "Just launched my new business! Check out our amazing products and services.",
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
    }
  ],
  recentReports: [
    {
      _id: "1",
      reporterId: "2",
      reporterName: "jane_smith",
      reportedContent: {
        type: "post",
        id: "3",
        preview: "SPAM: Buy now! Limited time offer! Click here for amazing deals!"
      },
      reason: "spam",
      description: "This post appears to be promotional content and violates our spam policy.",
      status: "pending",
      priority: "medium",
      createdAt: "2024-03-20T15:30:00Z"
    },
    {
      _id: "7",
      reporterId: "7",
      reporterName: "alex_taylor",
      reportedContent: {
        type: "user",
        id: "5",
        preview: "david_brown"
      },
      reason: "harassment",
      description: "This user has been following me and commenting on all my posts with inappropriate remarks.",
      status: "pending",
      priority: "high",
      createdAt: "2024-03-20T13:10:00Z"
    },
    {
      _id: "8",
      reporterId: "3",
      reporterName: "mike_wilson",
      reportedContent: {
        type: "post",
        id: "1",
        preview: "Amazing sunset at the beach! Perfect way to end the day."
      },
      reason: "violence",
      description: "This post contains graphic content that promotes violence.",
      status: "pending",
      priority: "urgent",
      createdAt: "2024-03-20T17:45:00Z"
    }
  ]
};