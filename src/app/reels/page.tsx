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

<<<<<<< Updated upstream
=======
  // Local storage keys for persisting states
  const LIKES_STORAGE_KEY = 'findernate-reel-likes';
  const LIKE_COUNTS_STORAGE_KEY = 'findernate-reel-like-counts';
  const FOLLOW_STORAGE_KEY = 'findernate-reel-follows';

  // Helper functions for localStorage
  const getLikedReelsFromStorage = (): Set<string> => {
    try {
      const stored = localStorage.getItem(LIKES_STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };

  const getLikeCountsFromStorage = (): Map<string, number> => {
    try {
      const stored = localStorage.getItem(LIKE_COUNTS_STORAGE_KEY);
      return stored ? new Map(Object.entries(JSON.parse(stored)).map(([k, v]) => [k, Number(v)])) : new Map();
    } catch {
      return new Map();
    }
  };

  const saveLikedReelToStorage = (reelId: string, isLiked: boolean, likeCount?: number) => {
    try {
      const likedReels = getLikedReelsFromStorage();
      const likeCounts = getLikeCountsFromStorage();
      
      if (isLiked) {
        likedReels.add(reelId);
      } else {
        likedReels.delete(reelId);
      }
      
      if (likeCount !== undefined) {
        likeCounts.set(reelId, likeCount);
      }
      
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify([...likedReels]));
      localStorage.setItem(LIKE_COUNTS_STORAGE_KEY, JSON.stringify(Object.fromEntries(likeCounts)));
    } catch (error) {
      console.warn('Failed to save like state to localStorage:', error);
    }
  };

  // Helper functions for follow states
  const getFollowedUsersFromStorage = (): Set<string> => {
    try {
      const stored = localStorage.getItem(FOLLOW_STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };

  const saveFollowStateToStorage = (userId: string, isFollowed: boolean) => {
    try {
      const followedUsers = getFollowedUsersFromStorage();
      
      if (isFollowed) {
        followedUsers.add(userId);
      } else {
        followedUsers.delete(userId);
      }
      
      localStorage.setItem(FOLLOW_STORAGE_KEY, JSON.stringify([...followedUsers]));
      console.log('Saved follow state to localStorage:', { userId, isFollowed });
    } catch (error) {
      console.warn('Failed to save follow state to localStorage:', error);
    }
  };

>>>>>>> Stashed changes
  // Fetch reels data from API
  useEffect(() => {
    const fetchReels = async () => {
      try {
        setLoading(true);
        const response = await getReels();
        console.log('Reels API response:', response);
        
        // Transform API response to match expected format
        const transformedData = response.reels?.map((item: any) => {
<<<<<<< Updated upstream
          const userDetail = item.userDetails?.[0] || {};
=======
          // Use userId object directly from API response
          const userObj = item.userId || {};
          
          // Check localStorage for like status and counts
          const likedReels = getLikedReelsFromStorage();
          const likeCounts = getLikeCountsFromStorage();
          const isLikedFromStorage = likedReels.has(item._id);
          const likeCountFromStorage = likeCounts.get(item._id);
          
          // Check localStorage for follow status
          const followedUsers = getFollowedUsersFromStorage();
          const userIdToCheck = userObj._id || '';
          const isFollowedFromStorage = followedUsers.has(userIdToCheck);
          
          // Use localStorage data if available, otherwise use API data
          const finalIsLiked = isLikedFromStorage || Boolean(item.isLikedBy || item.isLikedByUser || false);
          const finalLikeCount = likeCountFromStorage !== undefined ? likeCountFromStorage : (item.engagement?.likes || item.likesCount || 0);
          const finalIsFollowed = isFollowedFromStorage || Boolean(item.isFollowed || item.isFollowedByUser || false);
          
          console.log('Transforming reel item:', {
            id: item._id,
            originalLikes: item.engagement?.likes,
            originalLikesCount: item.likesCount,
            originalIsLikedBy: item.isLikedBy,
            originalIsLikedByUser: item.isLikedByUser,
            isLikedFromStorage,
            likeCountFromStorage,
            finalIsLiked,
            finalLikeCount,
            userId: item.userId,
            userObj: userObj,
            isFollowed: item.isFollowed,
            isFollowedByUser: item.isFollowedByUser,
            isFollowedFromStorage,
            finalIsFollowed
          });
>>>>>>> Stashed changes
          
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
<<<<<<< Updated upstream
            isLikedBy: item.isLikedBy || false,
            isFollowed: item.isFollowed || false,
=======
            isLikedBy: finalIsLiked,
            isFollowed: finalIsFollowed,
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isFollowed, setIsFollowed] = useState(false);
  const [isProcessing, setIsProcessing] = useState({
    like: false,
    save: false,
    follow: false,
    comment: false
  });

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const updateReelInState = (reelId: string, updates: any) => {
    setReelsData(prevData => 
      prevData.map(reel => 
        reel._id === reelId 
          ? { ...reel, ...updates }
          : reel
      )
    );
  };

  const refreshCurrentReel = async () => {
    try {
      const response = await getReels();
      const transformedData = response.reels?.map((item: any) => {
        const userObj = item.userId || {};
        
        // Check localStorage for like status and counts
        const likedReels = getLikedReelsFromStorage();
        const likeCounts = getLikeCountsFromStorage();
        const isLikedFromStorage = likedReels.has(item._id);
        const likeCountFromStorage = likeCounts.get(item._id);
        
        // Check localStorage for follow status
        const followedUsers = getFollowedUsersFromStorage();
        const userIdToCheck = userObj._id || '';
        const isFollowedFromStorage = followedUsers.has(userIdToCheck);
        
        // Use localStorage data if available, otherwise use API data
        const finalIsLiked = isLikedFromStorage || Boolean(item.isLikedBy || item.isLikedByUser || false);
        const finalLikeCount = likeCountFromStorage !== undefined ? likeCountFromStorage : (item.engagement?.likes || item.likesCount || 0);
        const finalIsFollowed = isFollowedFromStorage || Boolean(item.isFollowed || item.isFollowedByUser || false);
        
        console.log('Refreshing reel item:', {
          id: item._id,
          originalLikes: item.engagement?.likes,
          originalLikesCount: item.likesCount,
          originalIsLikedBy: item.isLikedBy,
          originalIsLikedByUser: item.isLikedByUser,
          isLikedFromStorage,
          likeCountFromStorage,
          finalIsLiked,
          finalLikeCount,
          isFollowedFromStorage,
          finalIsFollowed
        });
        
        return {
          _id: item._id,
          userId: {
            _id: userObj._id || '',
            username: userObj.username || 'Unknown User',
            profileImageUrl: item.profileImageUrl || '/placeholderimg.png',
          },
          username: userObj.username || 'Unknown User',
          profileImageUrl: item.profileImageUrl || '/placeholderimg.png',
          description: item.description || '',
          caption: item.caption || '',
          contentType: item.contentType || 'normal',
          postType: item.postType || 'photo',
          createdAt: item.createdAt,
          media: item.media || [],
          hashtags: item.hashtags || [],
          isLikedBy: finalIsLiked,
          isFollowed: finalIsFollowed,
          likedBy: item.likedBy || [],
          engagement: {
            comments: item.engagement?.comments || 0,
            impressions: item.engagement?.impressions || 0,
            likes: finalLikeCount,
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
      
      // Update local state to match server state
      const currentData = transformedData[currentReelIndex % transformedData.length];
      if (currentData) {
        setCommentsCount(currentData.engagement?.comments || 0);
        setLikesCount(currentData.engagement?.likes || 0);
        setIsLiked(currentData.isLikedBy || false);
        setIsFollowed(currentData.isFollowed || false);
      }
    } catch (error) {
      console.error('Error refreshing reel data:', error);
    }
  };
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
      setIsLiked(currentData.isLikedBy || false);
      setIsSaved(false); // You might want to check saved status from API
    }
  }, [currentReelIndex, reelsData]);

=======
      setIsLiked(Boolean(currentData.isLikedBy));
      
      // Debug follow state initialization
      console.log('=== FOLLOW STATE INIT ===');
      console.log('currentData.isFollowed:', currentData.isFollowed);
      console.log('Boolean(currentData.isFollowed):', Boolean(currentData.isFollowed));
      console.log('Setting isFollowed to:', Boolean(currentData.isFollowed));
      console.log('=== END FOLLOW STATE INIT ===');
      
      setIsFollowed(Boolean(currentData.isFollowed));
      setIsSaved(false); // Reset save state when changing reels
      
      // Fetch top 4 comments for the current reel
      getCommentsByPost(currentData._id, 1, 4)
        .then((data) => {
          setComments(Array.isArray(data.comments) ? data.comments : []);
        })
        .catch(() => setComments([]));
    } else {
      // Fallback to static data if no API data available
      const staticData = staticModalData[currentReelIndex % staticModalData.length];
      setCommentsCount(staticData.engagement?.comments || 0);
      setLikesCount(staticData.engagement?.likes || 0);
      setIsLiked(Boolean(staticData.isLikedBy));
      setIsFollowed(false); // Static data doesn't have follow status
      setIsSaved(false);
    }
  }, [currentReelIndex, reelsData]);

  // Initialize state when reelsData first loads
  useEffect(() => {
    if (reelsData.length > 0 && !loading) {
      console.log('Initializing state with fresh reels data');
      const currentData = getCurrentModalData();
      console.log('Initial data:', {
        id: currentData._id,
        likes: currentData.engagement?.likes,
        isLikedBy: currentData.isLikedBy,
        isFollowed: currentData.isFollowed
      });
      
      // Force state update to match server data
      setLikesCount(currentData.engagement?.likes || 0);
      setIsLiked(Boolean(currentData.isLikedBy));
      setCommentsCount(currentData.engagement?.comments || 0);
      
      // Debug follow state in initialization
      console.log('=== INIT FOLLOW STATE ===');
      console.log('currentData.isFollowed:', currentData.isFollowed);
      console.log('Setting isFollowed to:', Boolean(currentData.isFollowed));
      console.log('=== END INIT FOLLOW STATE ===');
      
      setIsFollowed(Boolean(currentData.isFollowed));
    }
  }, [reelsData, loading]);

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
  const handleFollowToggle = async () => {
    const currentData = getCurrentModalData();
    
    // Debug logging to check userId
    console.log('=== FOLLOW DEBUG START ===');
    console.log('Follow toggle - currentData:', JSON.stringify(currentData, null, 2));
    console.log('Follow toggle - userId object:', currentData.userId);
    console.log('Follow toggle - userId._id:', currentData.userId?._id);
    console.log('Follow toggle - currentData.userId type:', typeof currentData.userId);
    
    // Try multiple ways to extract userId
    let targetUserId = null;
    
    if (currentData.userId && typeof currentData.userId === 'object' && currentData.userId._id) {
      targetUserId = currentData.userId._id;
      console.log('Using userId._id:', targetUserId);
    } else if (typeof currentData.userId === 'string') {
      targetUserId = currentData.userId;
      console.log('Using userId as string:', targetUserId);
    } else {
      console.error('Cannot extract userId from:', currentData.userId);
    }
    
    if (!targetUserId || targetUserId === '' || targetUserId === 'undefined') {
      console.error('No valid userId found for follow action');
      console.log('targetUserId value:', targetUserId);
      showToastMessage('Unable to follow: Invalid user data');
      return;
    }
    
    console.log('Follow toggle - final userId:', targetUserId);
    console.log('=== FOLLOW DEBUG END ===');
    
    // Optimistic update
    const newIsFollowed = !isFollowed;
    setIsFollowed(newIsFollowed);
    
    updateReelInState(currentData._id, {
      isFollowed: newIsFollowed
    });

    try {
      if (newIsFollowed) {
        console.log('Calling followUser with:', targetUserId);
        await followUser(targetUserId);
        // Save to localStorage for persistence
        saveFollowStateToStorage(targetUserId, true);
        showToastMessage(`Now following @${currentData.username}!`);
      } else {
        console.log('Calling unfollowUser with:', targetUserId);
        await unfollowUser(targetUserId);
        // Save to localStorage for persistence
        saveFollowStateToStorage(targetUserId, false);
        showToastMessage(`Unfollowed @${currentData.username}`);
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setIsFollowed(!newIsFollowed);
      
      updateReelInState(currentData._id, {
        isFollowed: !newIsFollowed
      });
      
      console.error('Error toggling follow:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      // Handle specific error codes
      if (error.response?.status === 409) {
        showToastMessage('Follow status already updated. Refreshing...');
        setTimeout(() => refreshCurrentReel(), 1000);
      } else if (error.response?.status === 401) {
        showToastMessage('Please sign in to follow users');
      } else if (error.response?.status === 404) {
        showToastMessage('User not found');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || '';
        if (errorMessage.includes('yourself')) {
          showToastMessage("You can't follow yourself");
        } else if (errorMessage.includes('Already following')) {
          // If already following, sync the state to match reality
          console.log('Already following - syncing state to followed');
          console.log('Before sync - isFollowed state:', isFollowed);
          setIsFollowed(true);
          updateReelInState(currentData._id, {
            isFollowed: true
          });
          // Save to localStorage for persistence
          saveFollowStateToStorage(targetUserId, true);
          console.log('After sync - should be true');
          showToastMessage(`Already following @${currentData.username}!`);
          return; // Don't revert the optimistic update
        } else if (errorMessage.includes('not following') || errorMessage.includes('Not following')) {
          // If not following when trying to unfollow, sync the state
          console.log('Not following - syncing state to unfollowed');
          setIsFollowed(false);
          updateReelInState(currentData._id, {
            isFollowed: false
          });
          // Save to localStorage for persistence
          saveFollowStateToStorage(targetUserId, false);
          showToastMessage(`Not following @${currentData.username}`);
          return; // Don't revert the optimistic update
        } else {
          showToastMessage(`Follow error: ${errorMessage || 'Invalid request'}`);
        }
      } else {
        showToastMessage('Failed to update follow status. Please try again.');
      }
    }
  };

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-full text-sm font-semibold text-white transition-colors mr-2">
              {currentModalData.isFollowed ? 'Following' : 'Follow'}
=======
            <button 
              onClick={() => {
                console.log('=== BUTTON CLICK DEBUG ===');
                console.log('Current isFollowed state:', isFollowed);
                console.log('Button should show:', isFollowed ? 'Following' : 'Follow');
                console.log('=== END BUTTON CLICK DEBUG ===');
                handleFollowToggle();
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors mr-2 ${
                isFollowed 
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              {isFollowed ? 'Following' : 'Follow'}
>>>>>>> Stashed changes
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
