'use client';
// TODO:
// 1. Add reply to comment feature
// 2. Add reply to comment feature
// 3. Add reply to comment feature
// 4. Add reply to comment feature


import ProductServiceDetails from '@/components/ProductServiceDetails'
import ReelsComponent from '@/components/ReelsComp'
import ReelCommentsSection from '@/components/ReelCommentsSection'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createComment, getCommentsByPost, Comment as CommentType } from '@/api/comment'
import { getReels, likeReel, unlikeReel } from '@/api/reels'
import { savePost, unsavePost } from '@/api/post'
import { followUser, unfollowUser } from '@/api/user'
import { Heart, MoreVertical, Bookmark, BookmarkCheck } from 'lucide-react'
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { AuthDialog } from '@/components/AuthDialog';

// Timeout utility for API calls
const createTimeoutPromise = (timeout: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeout);
  });
};

const Page = () => {
  const router = useRouter();
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [reelsData, setReelsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  // Auth guard for gating actions (e.g., three dots menu) when user not logged in
  const { requireAuth, showAuthDialog, closeAuthDialog } = useAuthGuard();

  // Local storage keys for persisting states
  const LIKES_STORAGE_KEY = 'findernate-reel-likes';
  const LIKE_COUNTS_STORAGE_KEY = 'findernate-reel-like-counts';
  const FOLLOW_STORAGE_KEY = 'findernate-reel-follows';
  const SAVES_STORAGE_KEY = 'findernate-reel-saves';

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for sidebar close event to show arrow again
  useEffect(() => {
    const handleSidebarClose = () => {
      setShowSidebarArrow(true);
    };
    
    window.addEventListener('close-mobile-sidebar', handleSidebarClose as EventListener);
    
    return () => {
      window.removeEventListener('close-mobile-sidebar', handleSidebarClose as EventListener);
    };
  }, []);



  // Manage body scroll for mobile reels
  useEffect(() => {
    if (isMobile) {
      document.body.classList.add('reels-open');
      return () => {
        document.body.classList.remove('reels-open');
      };
    }
  }, [isMobile]);

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

  // Helper functions for save states
  const getSavedReelsFromStorage = (): Set<string> => {
    try {
      const stored = localStorage.getItem(SAVES_STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };

  const saveSaveStateToStorage = (reelId: string, isSaved: boolean) => {
    try {
      const savedReels = getSavedReelsFromStorage();
      
      if (isSaved) {
        savedReels.add(reelId);
      } else {
        savedReels.delete(reelId);
      }
      
      localStorage.setItem(SAVES_STORAGE_KEY, JSON.stringify([...savedReels]));
      console.log('Saved save state to localStorage:', { reelId, isSaved });
    } catch (error) {
      console.warn('Failed to save save state to localStorage:', error);
    }
  };

  // Handle profile navigation
  const handleProfileClick = (username: string) => {
    if (username && username !== 'Unknown User') {
      router.push(`/userprofile/${username}`);
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
          // Use userId object directly from API response and userDetails as fallback
          const userObj = item.userId || {};
          const userDetail = item.userDetails?.[0] || {};
          
          // Check localStorage for like status and counts
          const likedReels = getLikedReelsFromStorage();
          const likeCounts = getLikeCountsFromStorage();
          const isLikedFromStorage = likedReels.has(item._id);
          const likeCountFromStorage = likeCounts.get(item._id);
          
          // Check localStorage for follow status
          const followedUsers = getFollowedUsersFromStorage();
          const userIdToCheck = userObj._id || userDetail._id || item.userId || '';
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
            userDetail: userDetail,
            isFollowed: item.isFollowed,
            isFollowedByUser: item.isFollowedByUser,
            isFollowedFromStorage,
            finalIsFollowed
          });
          
          return {
            _id: item._id,
            userId: {
              _id: userObj._id || userDetail._id || item.userId || '',
              username: userObj.username || userDetail.username || 'Unknown User',
              profileImageUrl: userObj.profileImageUrl || userDetail.profileImageUrl || item.profileImageUrl || '/placeholderimg.png',
            },
            username: userObj.username || userDetail.username || 'Unknown User',
            profileImageUrl: userObj.profileImageUrl || userDetail.profileImageUrl || item.profileImageUrl || '/placeholderimg.png',
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
      } catch (error) {
        console.error('Error fetching reels:', error);
        // Fallback to static data if API fails
        setReelsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReels(); // Re-enabled to use real API data
    // setLoading(false); // Commented out to use API data
  }, []);

  // Static modal data as fallback
  const staticModalData = [
    {
      _id: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId format
      userId: {
        _id: '507f1f77bcf86cd799439012', // Valid MongoDB ObjectId format
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
      isFollowed: false,
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
    // Add other static data items...
  ];

  // Initialize state with static data values for immediate display
  const [commentsCount, setCommentsCount] = useState(staticModalData[0].engagement.comments);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [likesCount, setLikesCount] = useState(staticModalData[0].engagement.likes);
  const [isLiked, setIsLiked] = useState(staticModalData[0].isLikedBy);
  const [isSaved, setIsSaved] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isFollowed, setIsFollowed] = useState(staticModalData[0].isFollowed);
  const [showSidebarArrow, setShowSidebarArrow] = useState(true);
  const [isProcessing, setIsProcessing] = useState({
    like: false,
    save: false,
    follow: false,
    comment: false
  });
  const [showComments, setShowComments] = useState(false); // New state for mobile comments drawer
  const [showShareModal, setShowShareModal] = useState(false); // New state for share modal
  const [showMoreModal, setShowMoreModal] = useState(false); // New state for more options modal

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
        const userDetail = item.userDetails?.[0] || {};
        
        // Check localStorage for like status and counts
        const likedReels = getLikedReelsFromStorage();
        const likeCounts = getLikeCountsFromStorage();
        const isLikedFromStorage = likedReels.has(item._id);
        const likeCountFromStorage = likeCounts.get(item._id);
        
        // Check localStorage for follow status
        const followedUsers = getFollowedUsersFromStorage();
        const userIdToCheck = userObj._id || userDetail._id || item.userId || '';
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
            _id: userObj._id || userDetail._id || item.userId || '',
            username: userObj.username || userDetail.username || 'Unknown User',
            profileImageUrl: userObj.profileImageUrl || userDetail.profileImageUrl || item.profileImageUrl || '/placeholderimg.png',
          },
          username: userObj.username || userDetail.username || 'Unknown User',
          profileImageUrl: userObj.profileImageUrl || userDetail.profileImageUrl || item.profileImageUrl || '/placeholderimg.png',
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

  // Get current modal data based on reel index
  const getCurrentModalData = () => {
    if (reelsData.length === 0) {
      return staticModalData[currentReelIndex % staticModalData.length];
    }
    return reelsData[currentReelIndex % reelsData.length];
  };

  // Check if we're using real API data
  const isUsingRealData = reelsData.length > 0 && getCurrentModalData()?._id?.length === 24;

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

  // Initialize engagement counts immediately on component mount
  useEffect(() => {
    const currentData = getCurrentModalData();
    console.log('Initial mount - setting engagement data:', {
      comments: currentData.engagement?.comments,
      likes: currentData.engagement?.likes,
      isLikedBy: currentData.isLikedBy,
      isFollowed: currentData.isFollowed
    });
    
    setCommentsCount(currentData.engagement?.comments || 0);
    setLikesCount(currentData.engagement?.likes || 0);
    setIsLiked(Boolean(currentData.isLikedBy));
    setIsFollowed(Boolean(currentData.isFollowed));
  }, []); // Run only once on mount

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
      
      // Debug follow state initialization
      // console.log('=== FOLLOW STATE INIT ===');
      // console.log('currentData.isFollowed:', currentData.isFollowed);
      // console.log('Boolean(currentData.isFollowed):', Boolean(currentData.isFollowed));
      // console.log('Setting isFollowed to:', Boolean(currentData.isFollowed));
      // console.log('=== END FOLLOW STATE INIT ===');
      
      setIsFollowed(Boolean(currentData.isFollowed));
      
      // Check saved status for current reel using localStorage first
      const checkSavedStatus = () => {
        try {
          if (currentData._id?.length === 24) {
            // Check localStorage first for immediate response
            const savedReels = getSavedReelsFromStorage();
            const isLocallyMarkedSaved = savedReels.has(currentData._id);
            
            console.log('Checking saved status for reel:', currentData._id);
            console.log('localStorage saved reels:', [...savedReels]);
            console.log('Is locally saved:', isLocallyMarkedSaved);
            
            setIsSaved(isLocallyMarkedSaved);
          } else {
            setIsSaved(false);
          }
        } catch (error) {
          console.error('Error checking saved status:', error);
          setIsSaved(false);
        }
      };
      
      checkSavedStatus();
      
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
  // Initialize state when reelsData first loads - this runs immediately when data is available
  useEffect(() => {
    if (reelsData.length > 0) {
      console.log('Initializing state with fresh reels data, loading:', loading);
      const currentData = getCurrentModalData();
      console.log('Initial data:', {
        id: currentData._id,
        likes: currentData.engagement?.likes,
        isLikedBy: currentData.isLikedBy,
        comments: currentData.engagement?.comments,
        isFollowed: currentData.isFollowed
      });
      
      // Force state update to match server data immediately
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
  }, [reelsData]);
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
  const handleCommentCountChange = (newCount: number) => {
    setCommentsCount(newCount);
  };

  const handleLikeToggle = async () => {
    if (isProcessing.like) return; // Prevent double-clicks
    
    const currentData = getCurrentModalData();
    
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
        await Promise.race([likeReel(currentData._id), createTimeoutPromise(10000)]);
      } else {
        await Promise.race([unlikeReel(currentData._id), createTimeoutPromise(10000)]);
      }
    } catch (error: any) {
      // Handle "already liked" or "like not found" as success
      if (error?.response?.status === 409) {
        // Don't revert - the state is already correct
        return;
      }
      
      // Revert optimistic update on actual errors
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
    // Show custom share modal instead of native share
    setShowShareModal(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToastMessage('Link copied to clipboard!');
      setShowShareModal(false);
    } catch (error: any) {
      console.error('Error copying link:', error);
      showToastMessage('Failed to copy link');
    }
  };

  const handleSaveToggle = async () => {
    const currentData = getCurrentModalData();
    
    // Check if this is real API data (MongoDB ObjectId is 24 characters) or fallback static data
    if (!currentData._id || currentData._id.length !== 24 || reelsData.length === 0) {
      console.warn('Cannot save: Using fallback static data or no real post ID');
      showToastMessage('Cannot save demo reels');
      return;
    }
    
    // Optimistic update
    const newIsSaved = !isSaved;
    setIsSaved(newIsSaved);

    // Persist optimistic state immediately so effects reading localStorage don't override UI
    saveSaveStateToStorage(currentData._id, newIsSaved);
    
    updateReelInState(currentData._id, {
      engagement: {
        ...currentData.engagement,
        saves: newIsSaved 
          ? currentData.engagement.saves + 1 
          : Math.max(0, currentData.engagement.saves - 1)
      }
    });

    try {
      if (newIsSaved) {
        await savePost(currentData._id); // Use post API since reels are posts
      } else {
        await unsavePost(currentData._id); // Use post API since reels are posts
      }
    } catch (error: any) {
      // Revert optimistic update on error (including localStorage)
      setIsSaved(!newIsSaved);
      saveSaveStateToStorage(currentData._id, !newIsSaved);
      
      updateReelInState(currentData._id, {
        engagement: {
          ...currentData.engagement,
          saves: newIsSaved 
            ? Math.max(0, currentData.engagement.saves - 1)
            : currentData.engagement.saves + 1
        }
      });
      
      console.error('Error toggling save:', error);
      showToastMessage('Failed to save reel. Please try again.');
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

  // Mobile layout - Full screen Instagram-style
  if (isMobile) {
    const currentModalData = getCurrentModalData();
    
    return (
      <div className="relative">
        {/* Reels-specific arrow to open sidebar (transparent bg, closer to left) */}
        {showSidebarArrow && (
          <button
            onClick={() => {
              try {
                const evt = new Event('open-mobile-sidebar');
                window.dispatchEvent(evt);
                setShowSidebarArrow(false); // Hide arrow after clicking
              } catch {}
            }}
            className="fixed left-2 top-1/2 -translate-y-1/2 z-[65] md:hidden p-2"
            aria-label="Open Menu"
          >
            <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {/* Auth Dialog */}
        <AuthDialog isOpen={showAuthDialog} onClose={closeAuthDialog} />
        
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-4 right-4 z-[60] bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300">
            {toastMessage}
          </div>
        )}

        {/* Mobile Reels Component */}
        <ReelsComponent 
          onReelChange={setCurrentReelIndex} 
          apiReelsData={reelsData}
          onLikeToggle={handleLikeToggle}
          onCommentClick={() => {
            // Show comments drawer on same page
            setShowComments(true);
          }}
          onShareClick={handleShareClick}
          onSaveToggle={handleSaveToggle}
          onMoreClick={() => requireAuth(() => setShowMoreModal(true))}
          isLiked={isLiked}
          isSaved={isSaved}
          likesCount={likesCount}
          commentsCount={commentsCount}
          sharesCount={currentModalData.engagement?.shares || 0}
          isMobile={true}
          username={currentModalData.username || 'Unknown User'}
          description={currentModalData.description || ''}
          hashtags={currentModalData.hashtags || []}
          onProfileClick={handleProfileClick}
        />

        {/* Mobile Comments Drawer */}
        {showComments && (
          <div className="fixed inset-0 bg-black/50 z-[70] flex items-end">
            <div className="bg-white w-full h-4/5 rounded-t-3xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">Comments ({commentsCount})</h3>
                <button 
                  onClick={() => setShowComments(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Comments Content */}
              <div className="flex-1 overflow-y-auto p-4 min-h-0 overscroll-behavior-contain">
                <div className="pb-4">
                  <ReelCommentsSection
                    postId={currentModalData._id}
                    initialCommentCount={commentsCount}
                    onCommentCountChange={handleCommentCountChange}
                    maxVisible={50}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Share Reel</h3>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Share Options */}
              <div className="space-y-4">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Copy Link</div>
                    <div className="text-sm text-gray-500">Share this reel with others</div>
                  </div>
                </button>

                {navigator.share && (
                  <button
                    onClick={() => {
                      navigator.share({
                        title: `Check out this reel by ${currentModalData.username}`,
                        text: currentModalData.description || 'Amazing content!',
                        url: window.location.href
                      });
                      setShowShareModal(false);
                    }}
                    className="w-full flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Share</div>
                      <div className="text-sm text-gray-500">Use system share options</div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile More Options Dropdown */}
        {showMoreModal && (
          <div className="fixed inset-0 z-[70]" onClick={() => setShowMoreModal(false)}>
            <div className="absolute right-16 bottom-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showToastMessage('Report submitted');
                  setShowMoreModal(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Report</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showToastMessage('User blocked');
                  setShowMoreModal(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
                <span>Block User</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop layout - Original design
  return (
    <div className="flex h-screen bg-gray-100 gap-6 p-6">
  {/* Auth Dialog (shown if unauthenticated user triggers protected action) */}
  <AuthDialog isOpen={showAuthDialog} onClose={closeAuthDialog} />
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300">
          {toastMessage}
        </div>
      )}

      {/* Left Modal - Only show for business, product, or service reels */}
      <div className="w-80 bg-white rounded-2xl overflow-y-auto border border-gray-200">
        {(() => {
          const currentData = getCurrentModalData();
          const contentType = currentData?.contentType?.toLowerCase();
          const postType = currentData?.postType?.toLowerCase();
          
          // Show ProductServiceDetails only for specific content types
          if (contentType === 'business' || contentType === 'product' || contentType === 'service' ||
              postType === 'business' || postType === 'product' || postType === 'service') {
            return (
              <ProductServiceDetails 
                post={currentData} 
                onClose={() => {}} 
                isSidebar={true}
              />
            );
          }
          
          // For normal reels, show a minimal placeholder or blank space
          return (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <p className="text-sm">Regular Reel</p>
                <p className="text-xs mt-1">No additional details</p>
              </div>
            </div>
          );
        })()}
      </div>
      
      {/* Center - Reels */}
      <div className="flex-1 flex justify-center items-center">
        <ReelsComponent 
          onReelChange={setCurrentReelIndex} 
          apiReelsData={reelsData}
          isMobile={false}
        />
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
              className="w-12 h-12 rounded-full mr-3 object-cover cursor-pointer hover:opacity-80 transition-opacity"
              width={48}
              height={48}
              unoptimized
              onClick={(e) => {
                e.stopPropagation();
                handleProfileClick(currentModalData.username);
              }}
            />
            <div className="flex-1">
              <span 
                className="font-semibold text-lg text-gray-900 cursor-pointer hover:text-yellow-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProfileClick(currentModalData.username);
                }}
              >
                @{currentModalData.username || 'Unknown User'}
              </span>
            </div>
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
            </button>
            
            {/* Three dots menu */}
            <div className="relative">
              <button
                onClick={() => requireAuth(() => setShowDropdown(prev => !prev))}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px] max-w-[200px] transform -translate-x-0 sm:right-0 sm:left-auto left-0">
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
              className="flex items-center p-2 rounded-lg transition-colors text-gray-600 hover:text-yellow-600 hover:bg-gray-100"
            >
              {isSaved ? (
                <BookmarkCheck className="w-6 h-6 text-yellow-600" />
              ) : (
                <Bookmark className="w-6 h-6" />
              )}
            </button>
            
            <button 
              // onClick={handleShareClick}
              className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-green-500 hover:bg-gray-100 transition-colors"
            >
              <Image 
                src="/reply.png" 
                alt="Share" 
                width={24} 
                height={24} 
                className="w-6 h-6"
              />
              {/* <span className="text-sm font-medium">{formatNumber(currentModalData.engagement?.shares || 0)}</span> */}
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="overflow-y-auto">
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