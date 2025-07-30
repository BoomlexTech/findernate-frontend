'use client'
import { getPostsByUserid } from '@/api/homeFeed';
import { getUserProfile } from '@/api/user';
import AccountSettings from '@/components/AccountSettings';
import FloatingHeader from '@/components/FloatingHeader';
import PostCard from '@/components/PostCard';
import ProfilePostsSection from '@/components/ProfilePostsSection';
import UserProfile from '@/components/UserProfile'
import { useUserStore } from '@/store/useUserStore';
import { FeedPost, UserProfile as UserProfileType } from '@/types';
import React, { useEffect, useState } from 'react'

const Page = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [profileData, setProfileData] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user profile
        const profileResponse = await getUserProfile();
        console.log("Profile API response:", profileResponse);
        
        // Updated to match actual API response structure
        if (profileResponse?.userId) {
          setProfileData(profileResponse.userId);
        } else {
          throw new Error("Profile data not found in response");
        }
        
        // Fetch user posts
        const postsResponse = await getPostsByUserid(user._id);
        setPosts(postsResponse.data?.posts || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?._id]);

  const handleProfileUpdate = async (updatedData: Partial<UserProfileType>) => {
    try {
      if (profileData) {
        setProfileData({ ...profileData, ...updatedData });
        // Here you would typically call an API to update the profile
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 max-w-6xl mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Loading profile data...</p>
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
        <p>No profile data available</p>
      </div>
    );
  }

  return (
    <div className='bg-gray-50 max-w-6xl mx-auto'>
      <FloatingHeader
        paragraph="Manage your account and business settings"
        heading="Profile"
        username={profileData.fullName || "User"}
        accountBadge={true}
      />

      <div className='flex flex-col gap-6'>
        <UserProfile 
          userData={profileData}
          isCurrentUser={true}
          onProfileUpdate={handleProfileUpdate}
        />
        <AccountSettings/>
        <div className='w-full'>
          <ProfilePostsSection
            PostCard={PostCard}
            posts={posts.map((post) => ({
              ...post,
              username: post.userId?.username || '',
              profileImageUrl: post.userId?.profileImageUrl || '',
            }))}  
          />
        </div>
      </div>
    </div>
  )
}

export default Page