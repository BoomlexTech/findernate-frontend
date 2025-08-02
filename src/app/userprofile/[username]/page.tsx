'use client'

import { getOtherUserProfile } from '@/api/user';
import { getUserPosts, getUserReels, getUserVideos } from '@/api/homeFeed';
// import FloatingHeader from '@/components/FloatingHeader';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch other user's profile
        const profileResponse = await getOtherUserProfile(username);
        console.log("Other user profile API response:", profileResponse);
        
        if (profileResponse.userId) {
          // Transform the backend response to include isFollowing
          const userProfileData = {
            ...profileResponse.userId,
            isFollowing: profileResponse.isFollowedBy === "True"
          };
          
          setProfileData(userProfileData);
          
          // Fetch user posts by default (photos)
          if (profileResponse.userId._id) {
            const postsResponse = await getUserPosts(profileResponse.userId._id);
            const postsWithUserInfo = (postsResponse.data?.posts || []).map((post: any) => ({
              ...post,
              username: profileResponse.userId.username,
              profileImageUrl: profileResponse.userId.profileImageUrl
            }));
            setPosts(postsWithUserInfo);
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
    
    setPostsLoading(true);
    try {
      switch (tab) {
        case 'posts':
          if (posts.length === 0) {
            const postsResponse = await getUserPosts(profileData._id);
            const postsWithUserInfo = (postsResponse.data?.posts || []).map((post: any) => ({
              ...post,
              username: profileData.username,
              profileImageUrl: profileData.profileImageUrl
            }));
            setPosts(postsWithUserInfo);
          }
          break;
        case 'reels':
          if (reels.length === 0) {
            const reelsResponse = await getUserReels(profileData._id);
            const reelsWithUserInfo = (reelsResponse.data?.posts || []).map((post: any) => ({
              ...post,
              username: profileData.username,
              profileImageUrl: profileData.profileImageUrl
            }));
            setReels(reelsWithUserInfo);
          }
          break;
        case 'videos':
          if (videos.length === 0) {
            const videosResponse = await getUserVideos(profileData._id);
            const videosWithUserInfo = (videosResponse.data?.posts || []).map((post: any) => ({
              ...post,
              username: profileData.username,
              profileImageUrl: profileData.profileImageUrl
            }));
            setVideos(videosWithUserInfo);
          }
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
    } finally {
      setPostsLoading(false);
    }
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