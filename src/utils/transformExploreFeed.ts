import { FeedPost, MediaItem } from "@/types";

export type RawExploreFeedItem = {
  _id: string;
  userId: {
    _id: string;
    username: string;
    profileImageUrl?: string;
    fullName?: string;
  } | string;
  createdAt: string;
  updatedAt: string;
  _type: 'reel' | 'post';
  
  // For reels
  videoUrl?: string;
  caption?: string;
  thumbnailUrl?: string;
  hashtags?: string[];
  music?: {
    title: string;
    url: string;
  };
  likes?: string[]; // Array of user IDs for reels
  comments?: string[]; // Array of comment IDs for reels
  views?: number;
  isPublic?: boolean;
  isFeatured?: boolean;
  
  // For posts
  postType?: string;
  contentType?: string;
  description?: string;
  mentions?: string[];
  media?: MediaItem[];
  customization?: {
    product?: {
      name: string;
      price: number;
      currency: string;
      images: string[];
      tags: string[];
      variants: any[];
      specifications: any[];
    };
    service?: {
      name: string;
      description: string;
      price: number;
      currency: string;
      category: string;
      subcategory: string;
      duration: number;
      tags: string[];
    };
    business?: {
      businessName: string;
      businessType: string;
      description: string;
      category: string;
      tags: string[];
    };
    normal?: {
      mood?: string;
      activity?: string;
      location?: {
        name: string;
        coordinates: {
          type: string;
          coordinates: [number, number];
        };
      };
      tags?: string[];
    };
  };
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    views: number;
    reach: number;
    impressions: number;
  };
  settings?: {
    visibility: string;
    allowComments: boolean;
    allowLikes: boolean;
    customAudience: string[];
  };
};

// Helper function to shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function transformExploreFeedToFeedPost(items: RawExploreFeedItem[]): FeedPost[] {
  return items.map((item: RawExploreFeedItem) => {
    // Helper function to get user info
    const getUserInfo = () => {
      if (typeof item.userId === 'object' && item.userId !== null) {
        return {
          username: item.userId.username || 'unknown_user',
          profileImageUrl: item.userId.profileImageUrl || '/default-avatar.png'
        };
      }
      return {
        username: 'unknown_user',
        profileImageUrl: '/default-avatar.png'
      };
    };

    const userInfo = getUserInfo();

    // Handle reels
    if (item._type === 'reel') {
      return {
        _id: item._id,
        username: userInfo.username,
        profileImageUrl: userInfo.profileImageUrl,
        description: item.caption || '',
        caption: item.caption || '',
        contentType: 'reel',
        postType: 'video',
        createdAt: item.createdAt,
        media: [{
          type: 'video' as const,
          url: item.videoUrl || '',
          thumbnailUrl: item.thumbnailUrl,
          duration: null,
          dimensions: undefined
        }],
        engagement: {
          comments: item.comments?.length || 0,
          impressions: 0,
          likes: item.likes?.length || 0,
          reach: 0,
          saves: 0,
          shares: 0,
          views: item.views || 0,
        },
        location: null,
        tags: item.hashtags || [],
        isLikedBy: false,
        likedBy: [],
      };
    }
    
    // Handle posts - get tags based on content type
    const getTags = () => {
      if (item.customization?.normal?.tags) return item.customization.normal.tags;
      if (item.customization?.product?.tags) return item.customization.product.tags;
      if (item.customization?.service?.tags) return item.customization.service.tags;
      if (item.customization?.business?.tags) return item.customization.business.tags;
      return item.hashtags || [];
    };

    // Handle posts
    return {
      _id: item._id,
      username: userInfo.username,
      profileImageUrl: userInfo.profileImageUrl,
      description: item.description || item.caption || '',
      caption: item.caption || '',
      contentType: item.contentType || 'normal',
      postType: item.postType || 'photo',
      createdAt: item.createdAt,
      media: item.media || [],
      engagement: item.engagement || {
        comments: 0,
        impressions: 0,
        likes: 0,
        reach: 0,
        saves: 0,
        shares: 0,
        views: 0,
      },
      location: item.customization?.normal?.location || null,
      tags: getTags(),
      isLikedBy: false,
      likedBy: [],
    };
  });
}