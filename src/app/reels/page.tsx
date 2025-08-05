'use client';

import ProductServiceDetails from '@/components/ProductServiceDetails'
import ReelsComponent from '@/components/ReelsComp'
import Comment from '@/components/Comment'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { createComment } from '@/api/comment'
import { getReels } from '@/api/reels'
import { Heart, MoreVertical, Bookmark } from 'lucide-react'

const Page = () => {
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [reelsData, setReelsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch reels data from API
  useEffect(() => {
    const fetchReels = async () => {
      try {
        setLoading(true);
        const response = await getReels();
        console.log('Reels API response:', response);
        
        // Transform API response to match expected format
        const transformedData = response.reels?.map((item: any) => {
          const userDetail = item.userDetails?.[0] || {};
          
          return {
            _id: item._id,
            userId: {
              _id: userDetail._id || item.userId,
              username: userDetail.username || 'Unknown User',
              profileImageUrl: userDetail.profileImageUrl || '/placeholderimg.png',
            },
            username: userDetail.username || 'Unknown User',
            profileImageUrl: userDetail.profileImageUrl || '/placeholderimg.png',
            description: item.description || '',
            caption: item.caption || '',
            contentType: item.contentType || 'normal',
            postType: item.postType || 'photo',
            createdAt: item.createdAt,
            media: item.media || [],
            hashtags: item.hashtags || [],
            isLikedBy: item.isLikedBy || false,
            isFollowed: item.isFollowed || false,
            likedBy: item.likedBy || [],
            engagement: {
              comments: item.engagement?.comments || 0,
              impressions: item.engagement?.impressions || 0,
              likes: item.engagement?.likes || 0,
              reach: item.engagement?.reach || 0,
              saves: item.engagement?.saves || 0,
              shares: item.engagement?.shares || 0,
              views: item.engagement?.views || 0,
            },
            location: item.location || null,
            tags: item.hashtags || [],
            customization: item.customization || null,
          };
        }) || [];
        
        setReelsData(transformedData);
      } catch (error) {
        console.error('Error fetching reels:', error);
        // Fallback to static data if API fails
        setReelsData(staticModalData);
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  // Static modal data as fallback
  const staticModalData = [
    {
      _id: '1',
      userId: {
        _id: 'user1',
        username: 'demo_user',
        profileImageUrl: '/placeholderimg.png'
      },
      username: 'demo_user',
      profileImageUrl: '/placeholderimg.png',
      description: 'Premium mountain photography equipment for sale!',
      caption: 'Professional Camera Gear',
      contentType: 'product',
      postType: 'product',
      createdAt: new Date().toISOString(),
      media: [],
      isLikedBy: false,
      likedBy: [],
      engagement: { comments: 15, impressions: 450, likes: 89, reach: 350, saves: 23, shares: 12, views: 1200 },
      location: { name: 'Mountain View, CA', coordinates: { type: 'Point', coordinates: [-122.0840, 37.3861] as [number, number] } },
      tags: ['photography', 'camera', 'mountains'],
      customization: {
        product: {
          name: 'Professional Camera Kit',
          price: '2499',
          currency: 'USD',
          inStock: true,
          link: '#'
        }
      }
    },
    {
      _id: '2',
      userId: {
        _id: 'user2',
        username: 'cafe_master',
        profileImageUrl: '/placeholderimg.png'
      },
      username: 'cafe_master',
      profileImageUrl: '/placeholderimg.png',
      description: 'Learn professional latte art techniques from a certified barista!',
      caption: 'Coffee Art Masterclass',
      contentType: 'service',
      postType: 'service',
      createdAt: new Date().toISOString(),
      media: [],
      isLikedBy: false,
      likedBy: [],
      engagement: { comments: 32, impressions: 720, likes: 156, reach: 580, saves: 45, shares: 28, views: 2100 },
      location: { name: 'Seattle, WA', coordinates: { type: 'Point', coordinates: [-122.3321, 47.6062] as [number, number] } },
      tags: ['coffee', 'art', 'barista', 'classes'],
      customization: {
        service: {
          name: 'Latte Art Workshop',
          price: '150',
          currency: 'USD',
          duration: '3 hours',
          link: '#'
        }
      }
    },
    {
      _id: '3',
      userId: {
        _id: 'user3',
        username: 'adventure_co',
        profileImageUrl: '/placeholderimg.png'
      },
      username: 'adventure_co',
      profileImageUrl: '/placeholderimg.png',
      description: 'Join our guided mountain climbing expeditions! Experience the thrill safely with certified guides.',
      caption: 'Mountain Adventure Tours',
      contentType: 'business',
      postType: 'business',
      createdAt: new Date().toISOString(),
      media: [],
      isLikedBy: false,
      likedBy: [],
      engagement: { comments: 89, impressions: 1500, likes: 340, reach: 1200, saves: 67, shares: 45, views: 3500 },
      location: { name: 'Denver, CO', coordinates: { type: 'Point', coordinates: [-104.9903, 39.7392] as [number, number] } },
      tags: ['adventure', 'climbing', 'tours', 'outdoors'],
      customization: {
        business: {
          name: 'Peak Adventures LLC',
          category: 'Adventure Tourism',
          website: 'https://peakadventures.com',
          phone: '+1-555-CLIMB',
          email: 'info@peakadventures.com'
        }
      }
    }
  ];

  const [commentsCount, setCommentsCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Get current modal data based on reel index
  const getCurrentModalData = () => {
    if (reelsData.length === 0) {
      return staticModalData[currentReelIndex % staticModalData.length];
    }
    return reelsData[currentReelIndex % reelsData.length];
  };

  // Get current reel data
  const getCurrentReelData = () => {
    if (reelsData.length === 0) {
      return {
        id: 1,
        user: {
          name: "demo_user",
          avatar: "/placeholderimg.png"
        },
        description: "Check out this amazing content! 🌟 #featured",
        comments: 89,
        likes: 1250,
        shares: 45,
        music: "Original Audio - demo_user"
      };
    }
    
    const currentData = reelsData[currentReelIndex % reelsData.length];
    return {
      id: currentData._id,
      user: {
        name: currentData.username,
        avatar: currentData.profileImageUrl
      },
      description: currentData.description,
      comments: currentData.engagement.comments,
      likes: currentData.engagement.likes,
      shares: currentData.engagement.shares,
      music: `${currentData.hashtags?.slice(0, 2).map(tag => `#${tag}`).join(' ') || 'Original Audio'} - ${currentData.username}`
    };
  };

  // Get current reel data dynamically
  const currentReel = getCurrentReelData();

  // Update counts when reel changes
  useEffect(() => {
    if (reelsData.length > 0) {
      const currentData = getCurrentModalData();
      setCommentsCount(currentData.engagement?.comments || 0);
      setLikesCount(currentData.engagement?.likes || 0);
      setIsLiked(currentData.isLikedBy || false);
      setIsSaved(false); // You might want to check saved status from API
    }
  }, [currentReelIndex, reelsData]);

  // Use current modal data for comment operations
  const currentModalData = getCurrentModalData();

  const handleCommentSubmit = async (comment: string) => {
    try {
      // Use current modal data ID
      await createComment({
        postId: currentModalData._id,
        content: comment
      });
      
      console.log('Comment submitted:', comment);
    } catch (error) {
      console.error('Error submitting comment:', error);
      throw error;
    }
  };

  const handleCommentCountChange = (newCount: number) => {
    setCommentsCount(newCount);
  };

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShareClick = () => {
    // Implement share functionality
    console.log('Share reel:', currentReel.id);
    if (navigator.share) {
      navigator.share({
        title: `Check out this reel by ${currentReel.user.name}`,
        text: currentReel.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    console.log(isSaved ? 'Unsaving reel:' : 'Saving reel:', currentReel.id);
    // Here you would implement the actual save/unsave API call
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };
  
      if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 gap-6 p-6">
      {/* Left Modal */}
      <div className="w-80 bg-white rounded-2xl overflow-y-auto border border-gray-200">
        <ProductServiceDetails 
          post={getCurrentModalData()} 
          onClose={() => {}} 
          isSidebar={true}
        />
      </div>
      
      {/* Center - Reels */}
      <div className="flex-1 flex justify-center items-center">
        <ReelsComponent onReelChange={setCurrentReelIndex} />
      </div>

      {/* Right sidebar - Profile Info + Comments */}
      <div className="w-96 bg-white rounded-2xl border border-gray-200 flex flex-col">
        {/* Profile Section */}
        <div className="p-6 border-b border-gray-200">
          {/* User info */}
          <div className="flex items-center mb-4">
            <Image
              src={currentModalData.profileImageUrl || '/placeholderimg.png'}
              alt={currentModalData.username || 'User'}
              className="w-12 h-12 rounded-full mr-3 object-cover"
              width={48}
              height={48}
              unoptimized
            />
            <div className="flex-1">
              <span className="font-semibold text-lg text-gray-900">@{currentModalData.username || 'Unknown User'}</span>
            </div>
            <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-full text-sm font-semibold text-white transition-colors mr-2">
              {currentModalData.isFollowed ? 'Following' : 'Follow'}
            </button>
            
            {/* Three dots menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                    Report
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                    Block User
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-800 mb-3 leading-relaxed">
            {currentModalData.description || 'No description available'}
          </p>

          {/* Hashtags */}
          {currentModalData.hashtags && currentModalData.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {currentModalData.hashtags.map((tag:string, index:number) => (
                <span key={index} className="text-yellow-500 text-sm">#{tag}</span>
              ))}
            </div>
          )}

          {/* Content Type Badge */}
          {currentModalData.contentType && (
            <div className="mb-4">
              <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                {currentModalData.contentType.charAt(0).toUpperCase() + currentModalData.contentType.slice(1)}
              </span>
            </div>
          )}

          {/* Like, Save, and Share buttons */}
          <div className="flex items-center space-x-6">
            <button 
              onClick={handleLikeToggle}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                isLiked 
                  ? 'text-red-500' 
                  : 'text-gray-600 hover:text-red-500'
              } hover:bg-gray-100`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{formatNumber(currentModalData.engagement?.likes || 0)}</span>
            </button>

            <button 
              onClick={handleSaveToggle}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                isSaved 
                  ? 'text-yellow-600' 
                  : 'text-gray-600 hover:text-yellow-600'
              } hover:bg-gray-100`}
            >
              <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{formatNumber(currentModalData.engagement?.saves || 0)}</span>
            </button>
            
            <button 
              onClick={handleShareClick}
              className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-green-500 hover:bg-gray-100 transition-colors"
            >
              <Image 
                src="/reply.png" 
                alt="Share" 
                width={24} 
                height={24} 
                className="w-6 h-6"
              />
              <span className="text-sm font-medium">{formatNumber(currentModalData.engagement?.shares || 0)}</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
          
          {/* Comment Component */}
          <Comment
            postId={currentModalData._id}
            commentsCount={commentsCount}
            onCommentSubmit={handleCommentSubmit}
            onCommentCountChange={handleCommentCountChange}
            placeholder="Add a comment..."
            showCount={false}
            className="sticky bottom-0 bg-white pt-4 border-t border-gray-100"
          />
          
          {/* Comments List Placeholder */}
          <div className="mt-6 space-y-4">
            <div className="text-gray-500 text-center py-8">
              <p>Comments will appear here</p>
              <p className="text-sm">Be the first to comment!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
