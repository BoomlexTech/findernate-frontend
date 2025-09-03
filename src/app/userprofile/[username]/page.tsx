'use client'

import { getOtherUserProfile } from '@/api/user';
import { getUserPosts, getUserReels, getUserVideos } from '@/api/homeFeed';

import { getCommentsByPost } from '@/api/comment';
import FloatingHeader from '@/components/FloatingHeader';
import PostCard from '@/components/PostCard';
import ProfilePostsSection from '@/components/ProfilePostsSection';
import UserProfile from '@/components/UserProfile';
import { FeedPost, UserProfile as UserProfileType } from '@/types';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const UserProfilePage = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [reels, setReels] = useState<FeedPost[]>([]);
  const [videos, setVideos] = useState<FeedPost[]>([]);
  const [profileData, setProfileData] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const username = params.username as string; // Assuming dynamic route is [username]

  // Helper function to fetch comment counts for posts
  const fetchCommentCounts = async (posts: any[]) => {
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        try {
          // Check localStorage first for efficiency
          const savedCommentsCount = localStorage.getItem(`post_comments_count_${post._id}`);
          if (savedCommentsCount !== null) {
            const localCount = parseInt(savedCommentsCount);
            // Use localStorage if it exists and is greater than API count
            if (localCount > (post.engagement?.comments || 0)) {
              return {
                ...post,
                engagement: {
                  ...post.engagement,
                  comments: localCount
                }
              };
            }
          }

          // Fetch actual comment count from API
          const commentsData = await getCommentsByPost(post._id, 1, 1); // Only fetch first page to get total count
          const actualCommentCount = commentsData.totalComments || 0;
          
          console.log(`Post ${post._id}: API comments=${actualCommentCount}, localStorage=${savedCommentsCount}`);
          
          return {
            ...post,
            engagement: {
              ...post.engagement,
              comments: actualCommentCount
            }
          };
        } catch (error) {
          console.error(`Error fetching comments for post ${post._id}:`, error);
          // Fallback to localStorage or original count
          const savedCommentsCount = localStorage.getItem(`post_comments_count_${post._id}`);
          return {
            ...post,
            engagement: {
              ...post.engagement,
              comments: savedCommentsCount ? parseInt(savedCommentsCount) : (post.engagement?.comments || 0)
            }
          };
        }
      })
    );
    return postsWithComments;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("=== DEBUG: Fetching profile for username:", username);
        
        // Fetch other user's profile
        const profileResponse = await getOtherUserProfile(username);
        console.log("=== DEBUG: Other user profile API response:", profileResponse);
        console.log("=== DEBUG: Profile response userId:", profileResponse.userId);
        
        if (profileResponse.userId) {
          // Transform the backend response to include isFollowing
          // Handle both string and boolean values for isFollowedBy
          const isFollowing = profileResponse.isFollowedBy === true || 
                             profileResponse.isFollowedBy === "True" || 
                             profileResponse.isFollowedBy === "true";
          
          console.log("Follow state debug:", {
            isFollowedBy: profileResponse.isFollowedBy,
            isFollowedByType: typeof profileResponse.isFollowedBy,
            calculatedIsFollowing: isFollowing
          });
          
          const userProfileData = {
            ...profileResponse.userId,
            isFollowing: isFollowing
          };
          
          console.log("=== DEBUG: Processed userProfileData:", userProfileData);
          console.log("=== DEBUG: userProfileData username:", userProfileData.username);
          console.log("=== DEBUG: userProfileData _id:", userProfileData._id);
          
          setProfileData(userProfileData);
          
          // Fetch user posts, reels, and videos on initial load
          if (profileResponse.userId._id) {
            // Fetch posts, reels, and videos in parallel
            const [postsResponse, reelsResponse, videosResponse] = await Promise.all([
              getUserPosts(profileResponse.userId._id),
              getUserReels(profileResponse.userId._id),
              getUserVideos(profileResponse.userId._id)
            ]);
            
            console.log('User posts API response:', postsResponse);
            console.log('User reels API response:', reelsResponse);
            console.log('User videos API response:', videosResponse);
            
            // Helper function to process any type of post data
            const processPostData = (response: any, type: string) => {
              return (response.data?.posts || []).map((post: any) => ({
                ...post,
                username: profileResponse.userId.username,
                profileImageUrl: profileResponse.userId.profileImageUrl,
                // Handle tags/hashtags - check customization and top-level fields
                tags: post.customization?.normal?.tags || 
                      post.customization?.business?.tags || 
                      post.customization?.service?.tags || 
                      post.customization?.product?.tags || 
                      (Array.isArray(post.tags) ? post.tags : 
                       Array.isArray(post.hashtags) ? post.hashtags :
                       (post.tags ? [post.tags] : 
                        post.hashtags ? [post.hashtags] : [])),
                // Ensure location is properly structured - check multiple possible locations
                location: post.location || 
                         post.customization?.normal?.location ||
                         (profileResponse.userId?.location ? profileResponse.userId.location : null),
                // Ensure engagement object has all required fields
                engagement: {
                  likes: post.engagement?.likes || 0,
                  comments: post.engagement?.comments || 0,
                  shares: post.engagement?.shares || 0,
                  ...post.engagement
                }
              }));
            };

            // Process all post types
            const postsWithUserInfo = processPostData(postsResponse, 'posts');
            const reelsWithUserInfo = processPostData(reelsResponse, 'reels');
            const videosWithUserInfo = processPostData(videosResponse, 'videos');

            // Fetch actual comment counts for all content types
            console.log('Fetching comment counts for posts, reels, and videos...');
            const [postsWithCommentCounts, reelsWithCommentCounts, videosWithCommentCounts] = await Promise.all([
              fetchCommentCounts(postsWithUserInfo),
              fetchCommentCounts(reelsWithUserInfo),
              fetchCommentCounts(videosWithUserInfo)
            ]);
            
            console.log('Posts with updated comment counts:', postsWithCommentCounts.length);
            console.log('Reels with updated comment counts:', reelsWithCommentCounts.length);
            console.log('Videos with updated comment counts:', videosWithCommentCounts.length);
            
            setPosts(postsWithCommentCounts);
            setReels(reelsWithCommentCounts);
            setVideos(videosWithCommentCounts);
          }
        } else {
          throw new Error("Profile data not found in response");
        }
        
      } catch (error) {
        console.error('Error fetching user profile data:', error);
        setError('Unable to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchData();
    }
  }, [username]);

  const handleTabChange = async (tab: string) => {
    if (!profileData?._id) return;
    
    // Since we now load all data on initial mount, we don't need to fetch anything here
    // This function now just handles the tab switching without API calls
    console.log(`Switching to ${tab} tab`);
    
    // Optional: Add refresh logic in the future if needed
    // For now, all data is already loaded on mount
  };

  if (loading) {
    return (
      <div className="bg-gray-50 max-w-6xl mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 max-w-6xl mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center text-yellow-500">
          <p className="text-lg font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="bg-gray-50 max-w-6xl mx-auto p-4 min-h-screen flex items-center justify-center">
        <p>User not found</p>
      </div>
    );
  }

  console.log("=== DEBUG: About to render UserProfile with data:", {
    username: profileData.username,
    fullName: profileData.fullName,
    _id: profileData._id,
    isCurrentUser: false
  });

  return (
    <div className='bg-gray-50 w-full mx-auto pt-2 px-4'>
      <div className='flex flex-col gap-6 mt-2'>
        <UserProfile 
          userData={profileData}
          isCurrentUser={false} // Important to distinguish between current user and others
        />
        
        <div className='w-full'>
          <ProfilePostsSection
            PostCard={PostCard}
            posts={posts}  
            reels={reels}
            videos={videos}
            isOtherUser={true}
            loading={postsLoading}
            onTabChange={handleTabChange}
          />
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage