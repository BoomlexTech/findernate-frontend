'use client'
import { getPostsByUserid } from '@/api/homeFeed';
import { getUserProfile } from '@/api/user';
import AccountSettings from '@/components/AccountSettings';
//import FloatingHeader from '@/components/FloatingHeader';
import PostCard from '@/components/PostCard';
import ProfilePostsSection from '@/components/ProfilePostsSection';
import UserProfile from '@/components/UserProfile'
import { useUserStore } from '@/store/useUserStore';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { FeedPost, UserProfile as UserProfileType } from '@/types';
import React, { useEffect, useState } from 'react'
import { LogIn, User } from 'lucide-react';

const Page = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [profileData, setProfileData] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore();
  const { isAuthenticated, isLoading } = useAuthGuard();

  useEffect(() => {
    const fetchData = async () => {
      // If user is not authenticated, don't fetch data, just stop loading
      if (!isAuthenticated || !user?._id) {
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
        console.log("Posts:", postsResponse.data?.posts);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?._id, isAuthenticated]);

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

  const handleLoginClick = () => {
    // Direct redirect to signin page instead of showing popup
    window.location.href = '/signin';
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="bg-gray-50 max-w-6xl mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading spinner while fetching profile data
  if (loading && isAuthenticated) {
    return (
      <div className="bg-gray-50 max-w-6xl mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Loading profile data...</p>
        </div>
      </div>
    );
  }

  // Show login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <>
        <div className="bg-gray-50 max-w-6xl mx-auto p-4 min-h-screen">
          {/* <FloatingHeader
            paragraph="Sign in to access your profile"
            heading="Profile"
            username="Guest"
            accountBadge={false}
          /> */}
          
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center bg-white rounded-2xl shadow-lg p-12 max-w-md w-full mx-4">
              <div className="mb-6">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re Not Logged In</h2>
                <p className="text-gray-600 leading-relaxed">
                  Sign in to view your profile, manage your posts, and access account settings.
                </p>
              </div>
              
              <button
                onClick={handleLoginClick}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Sign In to Continue
              </button>
              
              <p className="text-sm text-gray-500 mt-4">
                Don&apos;t have an account? <a href="/signup" className="text-yellow-600 hover:text-yellow-700 font-medium">Sign up to get started!</a>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-gray-50 max-w-6xl mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500 bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">Oops! Something went wrong</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show "no profile data" state (fallback)
  if (!profileData) {
    return (
      <div className="bg-gray-50 max-w-6xl mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">No Profile Data Available</p>
          <p className="text-gray-600 mb-6">We couldn&apos;t load your profile information.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Show authenticated profile page
  return (
    <>
      <div className='bg-gray-50 max-w-6xl mx-auto'>
        {/* <FloatingHeader
          paragraph="Manage your account and business settings"
          heading="Profile"
          username={profileData.fullName || "User"}
          accountBadge={true}
        /> */}

        <div className='flex flex-col gap-6 pt-5'>
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
                tags: post.customization?.normal?.tags || 
                      post.customization?.business?.tags || 
                      post.customization?.service?.tags || 
                      post.customization?.product?.tags || 
                      post.tags || [],
              }))}  
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Page