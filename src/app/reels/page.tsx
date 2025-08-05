'use client';

import ProductServiceDetails from '@/components/ProductServiceDetails'
import ReelsComponent from '@/components/ReelsComp'
import ReelCommentsSection from '@/components/ReelCommentsSection'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { createComment, getCommentsByPost, Comment as CommentType } from '@/api/comment'
import { getReels, likeReel, unlikeReel, saveReel, unsaveReel } from '@/api/reels'
import { followUser, unfollowUser } from '@/api/user'
import { Heart, MoreVertical, Bookmark } from 'lucide-react'

// Timeout utility for API calls
const createTimeoutPromise = (timeout: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeout);
  });
};

const Page = () => {
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [reelsData, setReelsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Local storage key for persisting like states
  const LIKES_STORAGE_KEY = 'findernate-reel-likes';
  const LIKE_COUNTS_STORAGE_KEY = 'findernate-reel-like-counts';

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

  // Fetch reels data from API
  useEffect(() => {
    const fetchReels = async () => {
      try {
        setLoading(true);
        const response = await getReels();
        console.log('Reels API response:', response);
        
        // Transform API response to match expected format
        const transformedData = response.reels?.map((item: any) => {
          // Use userId object directly from API response
          const userObj = item.userId || {};
          
          // Check localStorage for like status and counts
          const likedReels = getLikedReelsFromStorage();
          const likeCounts = getLikeCountsFromStorage();
          const isLikedFromStorage = likedReels.has(item._id);
          const likeCountFromStorage = likeCounts.get(item._id);
          
          // Use localStorage data if available, otherwise use API data
          const finalIsLiked = isLikedFromStorage || Boolean(item.isLikedBy || item.isLikedByUser || false);
          const finalLikeCount = likeCountFromStorage !== undefined ? likeCountFromStorage : (item.engagement?.likes || item.likesCount || 0);
          
          console.log('Transforming reel item:', {
            id: item._id,
            originalLikes: item.engagement?.likes,
            originalLikesCount: item.likesCount,
            originalIsLikedBy: item.isLikedBy,
            originalIsLikedByUser: item.isLikedByUser,
            isLikedFromStorage,
            likeCountFromStorage,
            finalIsLiked,
            finalLikeCount
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
            isFollowed: Boolean(item.isFollowed || false),
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
  const [comments, setComments] = useState<CommentType[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
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
        
        // Use localStorage data if available, otherwise use API data
        const finalIsLiked = isLikedFromStorage || Boolean(item.isLikedBy || item.isLikedByUser || false);
        const finalLikeCount = likeCountFromStorage !== undefined ? likeCountFromStorage : (item.engagement?.likes || item.likesCount || 0);
        
        console.log('Refreshing reel item:', {
          id: item._id,
          originalLikes: item.engagement?.likes,
          originalLikesCount: item.likesCount,
          originalIsLikedBy: item.isLikedBy,
          originalIsLikedByUser: item.isLikedByUser,
          isLikedFromStorage,
          likeCountFromStorage,
          finalIsLiked,
          finalLikeCount
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
          isFollowed: Boolean(item.isFollowed || false),
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

  // Update counts and fetch comments when reel changes
  useEffect(() => {
    console.log('useEffect triggered - reelsData.length:', reelsData.length, 'currentReelIndex:', currentReelIndex);
    
    if (reelsData.length > 0) {
      const currentData = getCurrentModalData();
      console.log('Current reel data for state update:', {
        id: currentData._id,
        likes: currentData.engagement?.likes,
        isLikedBy: currentData.isLikedBy,
        comments: currentData.engagement?.comments
      });
      
      setCommentsCount(currentData.engagement?.comments || 0);
      setLikesCount(currentData.engagement?.likes || 0);
      setIsLiked(Boolean(currentData.isLikedBy));
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
        isLikedBy: currentData.isLikedBy
      });
      
      // Force state update to match server data
      setLikesCount(currentData.engagement?.likes || 0);
      setIsLiked(Boolean(currentData.isLikedBy));
      setCommentsCount(currentData.engagement?.comments || 0);
      setIsFollowed(Boolean(currentData.isFollowed));
    }
  }, [reelsData, loading]);

  // Use current modal data for comment operations
  const currentModalData = getCurrentModalData();

  const handleCommentSubmit = async (comment: string) => {
    const currentData = getCurrentModalData();
    try {
      const response = await createComment({
        postId: currentData._id,
        content: comment
      });
      // Add new comment to the top of the list
      setComments((prev) => [
        {
          ...response,
          user: response.user || {
            _id: currentData.userId._id,
            username: currentData.username,
            profileImageUrl: currentData.profileImageUrl,
          }
        },
        ...prev.slice(0, 3)
      ]);
      // Update comment count
      setCommentsCount((prev) => prev + 1);
      updateReelInState(currentData._id, {
        engagement: {
          ...currentData.engagement,
          comments: (currentData.engagement?.comments || 0) + 1
        }
      });
      showToastMessage('Comment added successfully!');
      return response;
    } catch (error: any) {
      showToastMessage('Failed to add comment. Please try again.');
      throw error;
    }
  };

  const handleFollowToggle = async () => {
    const currentData = getCurrentModalData();
    
    // Optimistic update
    const newIsFollowed = !isFollowed;
    setIsFollowed(newIsFollowed);
    
    updateReelInState(currentData._id, {
      isFollowed: newIsFollowed
    });

    try {
      if (newIsFollowed) {
        await followUser(currentData.userId._id || currentData.userId);
        showToastMessage(`Now following @${currentData.username}!`);
      } else {
        await unfollowUser(currentData.userId._id || currentData.userId);
        showToastMessage(`Unfollowed @${currentData.username}`);
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setIsFollowed(!newIsFollowed);
      
      updateReelInState(currentData._id, {
        isFollowed: !newIsFollowed
      });
      
      console.error('Error toggling follow:', error);
      
      // Handle specific error codes
      if (error.response?.status === 409) {
        showToastMessage('Follow status already updated. Refreshing...');
        setTimeout(() => refreshCurrentReel(), 1000);
      } else if (error.response?.status === 401) {
        showToastMessage('Please sign in to follow users');
      } else if (error.response?.status === 404) {
        showToastMessage('User not found');
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('yourself')) {
        showToastMessage("You can't follow yourself");
      } else {
        showToastMessage('Failed to update follow status. Please try again.');
      }
    }
  };

  const handleCommentCountChange = (newCount: number) => {
    setCommentsCount(newCount);
  };

  const handleLikeToggle = async () => {
    if (isProcessing.like) return; // Prevent double-clicks
    
    const currentData = getCurrentModalData();
    
    // Validate reel ID before making API call
    if (!currentData._id || currentData._id === '' || currentData._id === 'undefined') {
      console.error('handleLikeToggle: Invalid reel ID:', currentData._id);
      showToastMessage('Invalid reel data. Please refresh.');
      return;
    }
    
    console.log('handleLikeToggle: Current like status:', isLiked);
    console.log('handleLikeToggle: Reel ID:', currentData._id);
    
    // Set processing state
    setIsProcessing(prev => ({ ...prev, like: true }));
    
    // Optimistic update
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);
    
    // Save optimistic update to localStorage immediately
    saveLikedReelToStorage(currentData._id, newIsLiked, newLikesCount);
    
    updateReelInState(currentData._id, {
      isLikedBy: newIsLiked,
      engagement: {
        ...currentData.engagement,
        likes: newLikesCount
      }
    });

    try {
      if (newIsLiked) {
        console.log('handleLikeToggle: Calling likeReel');
        try {
          await Promise.race([likeReel(currentData._id), createTimeoutPromise(10000)]);
          console.log('handleLikeToggle: Successfully liked reel');
          
          // Ensure state is consistent after successful API call
          setIsLiked(true);
          setLikesCount(newLikesCount);
          
          // Save to localStorage for persistence across refreshes
          saveLikedReelToStorage(currentData._id, true, newLikesCount);
          
          // Update the actual reels data to persist the change
          updateReelInState(currentData._id, {
            isLikedBy: true,
            engagement: {
              ...currentData.engagement,
              likes: newLikesCount
            }
          });
          
          showToastMessage('Liked!');
        } catch (likeError: any) {
          // Handle "already liked" error (409) as success
          if (likeError?.response?.status === 409) {
            console.log(`Reel ${currentData._id} already liked - treating as successful like`);
            
            // Ensure state reflects "liked" status
            setIsLiked(true);
            setLikesCount(newLikesCount);
            
            // Save to localStorage for persistence across refreshes
            saveLikedReelToStorage(currentData._id, true, newLikesCount);
            
            // Update reels data to maintain consistency
            updateReelInState(currentData._id, {
              isLikedBy: true,
              engagement: {
                ...currentData.engagement,
                likes: newLikesCount
              }
            });
            
            showToastMessage('Liked!');
            return; // Don't revert optimistic update since reel is effectively "liked"
          }
          throw likeError; // Re-throw other errors
        }
      } else {
        console.log('handleLikeToggle: Calling unlikeReel');
        try {
          await Promise.race([unlikeReel(currentData._id), createTimeoutPromise(10000)]);
          console.log('handleLikeToggle: Successfully unliked reel');
          
          // Ensure state is consistent after successful API call
          setIsLiked(false);
          setLikesCount(newLikesCount);
          
          // Save to localStorage for persistence across refreshes
          saveLikedReelToStorage(currentData._id, false, newLikesCount);
          
          // Update the actual reels data to persist the change
          updateReelInState(currentData._id, {
            isLikedBy: false,
            engagement: {
              ...currentData.engagement,
              likes: newLikesCount
            }
          });
          
          showToastMessage('Unliked!');
        } catch (unlikeError: any) {
          // Handle "like not found" error (409) as success for unlike
          if (unlikeError?.response?.status === 409) {
            console.log(`Reel ${currentData._id} already unliked - treating as successful unlike`);
            
            // Ensure state reflects "unliked" status
            setIsLiked(false);
            setLikesCount(newLikesCount);
            
            // Save to localStorage for persistence across refreshes
            saveLikedReelToStorage(currentData._id, false, newLikesCount);
            
            // Update reels data to maintain consistency
            updateReelInState(currentData._id, {
              isLikedBy: false,
              engagement: {
                ...currentData.engagement,
                likes: newLikesCount
              }
            });
            
            showToastMessage('Unliked!');
            return; // Don't revert optimistic update since reel is effectively "unliked"
          }
          throw unlikeError; // Re-throw other errors
        }
      }
      console.log('handleLikeToggle: API call successful');
    } catch (error: any) {
      console.error('handleLikeToggle: API call failed:', error);
      
      // Revert optimistic update on actual errors (not 409)
      setIsLiked(!newIsLiked);
      setLikesCount(newIsLiked ? newLikesCount - 1 : newLikesCount + 1);
      
      // Revert localStorage as well
      saveLikedReelToStorage(currentData._id, !newIsLiked, newIsLiked ? newLikesCount - 1 : newLikesCount + 1);
      
      updateReelInState(currentData._id, {
        isLikedBy: !newIsLiked,
        engagement: {
          ...currentData.engagement,
          likes: newIsLiked ? newLikesCount - 1 : newLikesCount + 1
        }
      });
      
      // Handle specific error codes
      if (error.response?.status === 401) {
        showToastMessage('Please sign in to like reels');
      } else if (error.response?.status === 404) {
        showToastMessage('Reel not found');
      } else {
        showToastMessage('Failed to update like. Please try again.');
      }
    } finally {
      // Reset processing state
      setTimeout(() => {
        setIsProcessing(prev => ({ ...prev, like: false }));
      }, 300);
    }
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

  const handleSaveToggle = async () => {
    const currentData = getCurrentModalData();
    
    // Optimistic update
    const newIsSaved = !isSaved;
    const newSavesCount = newIsSaved 
      ? currentData.engagement.saves + 1 
      : Math.max(0, currentData.engagement.saves - 1);
    
    setIsSaved(newIsSaved);
    
    updateReelInState(currentData._id, {
      engagement: {
        ...currentData.engagement,
        saves: newSavesCount
      }
    });

    try {
      if (newIsSaved) {
        await saveReel(currentData._id);
        showToastMessage('Reel saved!');
      } else {
        await unsaveReel(currentData._id);
        showToastMessage('Reel removed from saved');
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setIsSaved(!newIsSaved);
      
      updateReelInState(currentData._id, {
        engagement: {
          ...currentData.engagement,
          saves: newIsSaved 
            ? newSavesCount - 1 
            : newSavesCount + 1
        }
      });
      
      console.error('Error toggling save:', error);
      
      // Handle specific error codes
      if (error.response?.status === 409) {
        showToastMessage('Save status already updated. Refreshing...');
        setTimeout(() => refreshCurrentReel(), 1000);
      } else if (error.response?.status === 401) {
        showToastMessage('Please sign in to save reels');
      } else if (error.response?.status === 404) {
        showToastMessage('Reel not found');
      } else {
        showToastMessage('Failed to save reel. Please try again.');
      }
    }
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
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300">
          {toastMessage}
        </div>
      )}

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
            <button 
              onClick={handleFollowToggle}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors mr-2 ${
                isFollowed 
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              {isFollowed ? 'Following' : 'Follow'}
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
              disabled={isProcessing.like}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                isLiked 
                  ? 'text-red-500' 
                  : 'text-gray-600 hover:text-red-500'
              } hover:bg-gray-100 ${isProcessing.like ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''} ${isProcessing.like ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium">{formatNumber(likesCount)}</span>
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
        <div className="overflow-y-auto">
          {/* <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Comments ({commentsCount})
          </h3> */}
          
        {/* Comments Section - show only top 4 comments, no add or pagination */}
        <div className="">
          <ReelCommentsSection
            postId={currentModalData._id}
            initialCommentCount={commentsCount}
            onCommentCountChange={handleCommentCountChange}
            maxVisible={4}
          />
          <div className="text-center mt-2">
            <button
              className="text-yellow-600 hover:underline text-sm font-medium"
              onClick={() => window.open(`/post/${currentModalData._id}`, '_blank')}
            >
              More
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default Page
