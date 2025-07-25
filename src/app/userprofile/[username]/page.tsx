'use client'

import { getOtherUserProfile } from '@/api/user';
import { getPostsByUserid } from '@/api/homeFeed';
import FloatingHeader from '@/components/FloatingHeader';
import PostCard from '@/components/PostCard';
import ProfilePostsSection from '@/components/ProfilePostsSection';
import UserProfile from '@/components/UserProfile';
import { FeedPost, UserProfile as UserProfileType } from '@/types';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const UserProfilePage = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [profileData, setProfileData] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
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
          setProfileData(profileResponse.userId);
          
          // Fetch user posts if needed
          if (profileResponse.userId._id) {
            const postsResponse = await getPostsByUserid(profileResponse.userId._id);
            setPosts(postsResponse.data?.posts || []);
          }
        } else {
          throw new Error("Profile data not found in response");
        }
        
      } catch (error) {
        console.error('Error fetching user profile data:', error);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchData();
    }
  }, [username]);

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
        <div className="text-center text-red-500">
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
    <div className='bg-gray-50 max-w-6xl mx-auto'>
      <FloatingHeader
        paragraph={`Viewing ${profileData.username}'s profile`}
        heading="User Profile"
        username={profileData.fullName || profileData.username || "User"}
        accountBadge={false}
      />

      <div className='flex flex-col gap-6'>
        <UserProfile 
          userData={profileData}
          isCurrentUser={false} // Important to distinguish between current user and others
        />
        
        {/* <div className='w-full'>
          <ProfilePostsSection
            PostCard={PostCard}
            posts={posts}  
          />
        </div> */}
      </div>
    </div>
  )
}

export default UserProfilePage