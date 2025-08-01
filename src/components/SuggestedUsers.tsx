// SuggestedUsers.tsx
'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { followUser, getSuggestedUsers, unfollowUser } from '@/api/user';
import { UserPlus, UserMinus } from 'lucide-react';
import { AxiosError } from 'axios';

interface SuggestedUser {
  _id: string;
  fullName: string;
  username: string;
  followersCount: number;
  profileImageUrl?: string;
  isFollowing?: boolean;
}

interface SuggestedUsersProps {
  users?: SuggestedUser[];
}

const defaultSuggestedUsers: SuggestedUser[] = [
  {
    _id: '1',
    fullName: 'Alex Thompson',
    username: 'alexthompson',
    followersCount: 12500,
    profileImageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    isFollowing: false,
  },
  {
    _id: '2',
    fullName: 'Jessica Wu',
    username: 'jessicawu',
    followersCount: 8900,
    profileImageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    isFollowing: false,
  },
  {
    _id: '3',
    fullName: 'David Miller',
    username: 'davidmiller',
    followersCount: 15200,
    profileImageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    isFollowing: false,
  },
  {
    _id: '4',
    fullName: 'Sophie Chen',
    username: 'sophiechen',
    followersCount: 6700,
    profileImageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    isFollowing: false,
  }
];

export default function SuggestedUsers({ users: initialUsers = defaultSuggestedUsers }: SuggestedUsersProps) {
  const [users, setUsers] = useState<SuggestedUser[]>(Array.isArray(initialUsers) ? initialUsers : []);
  const [userStates, setUserStates] = useState<{[key: string]: {isFollowing: boolean, followersCount: number, isLoading: boolean}}>(() => {
    return (Array.isArray(initialUsers) ? initialUsers : []).reduce((acc, user) => ({
      ...acc,
      [user._id]: {
        isFollowing: user.isFollowing || false,
        followersCount: user.followersCount,
        isLoading: false
      }
    }), {});
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSuggestedUsers() {
      setLoading(true);
      setError(null);
      try {
        const res = await getSuggestedUsers();
        console.log("suggested for you",res)
        const safeUsers = Array.isArray(res) ? res : [];
        setUsers(safeUsers);
        setUserStates(safeUsers.reduce((acc, user) => ({
          ...acc,
          [user._id]: {
            isFollowing: user.isFollowing || false,
            followersCount: user.followersCount,
            isLoading: false
          }
        }), {}));
      } catch (err) {
        console.log(err);
        setError('suggestions not found.');
        setUsers(defaultSuggestedUsers);
        setUserStates(defaultSuggestedUsers.reduce((acc, user) => ({
          ...acc,
          [user._id]: {
            isFollowing: user.isFollowing || false,
            followersCount: user.followersCount,
            isLoading: false
          }
        }), {}));
      } finally {
        setLoading(false);
      }
    }
    fetchSuggestedUsers();
  }, []);

  const formatFollowers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleFollowToggle = async (userId: string) => {
    const currentState = userStates[userId];
    if (currentState?.isLoading) return;

    setUserStates(prev => ({
      ...prev,
      [userId]: { ...prev[userId], isLoading: true }
    }));

    try {
      if (currentState?.isFollowing) {
        await unfollowUser(userId);
        setUserStates(prev => ({
          ...prev,
          [userId]: {
            isFollowing: false,
            followersCount: prev[userId].followersCount - 1,
            isLoading: false
          }
        }));
      } else {
        await followUser(userId);
        setUserStates(prev => ({
          ...prev,
          [userId]: {
            isFollowing: true,
            followersCount: prev[userId].followersCount + 1,
            isLoading: false
          }
        }));
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data as string;
      
      // Handle specific error cases
      if (errorMessage === 'Already following') {
        // Update state to reflect reality
        setUserStates(prev => ({
          ...prev,
          [userId]: {
            isFollowing: true,
            followersCount: prev[userId].followersCount,
            isLoading: false
          }
        }));
        console.log('User was already following - updating UI state');
      } else if (errorMessage === 'Not following this user') {
        // Update state to reflect reality
        setUserStates(prev => ({
          ...prev,
          [userId]: {
            isFollowing: false,
            followersCount: prev[userId].followersCount,
            isLoading: false
          }
        }));
        console.log('User was not following - updating UI state');
      } else {
        // Show user-friendly error message for other errors
        alert(errorMessage || 'Failed to update follow status');
        
        // Reset to original state on other errors
        const originalUser = users.find(u => u._id === userId);
        setUserStates(prev => ({
          ...prev,
          [userId]: { 
            isFollowing: originalUser?.isFollowing || false,
            followersCount: originalUser?.followersCount || 0,
            isLoading: false 
          }
        }));
      }
    }
  };

  return (
    <div className="  bg-gray-100 rounded-xl shadow-sm border border-gray-200 p-6">
     <div className="flex items-center gap-2 mb-4">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-users w-5 h-5 text-gray-600"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
  <h3 className="text-lg font-semibold text-gray-900">Suggested for You</h3>
</div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading suggestions...</div>
      ) : error ? (
        <div className="py-8 text-center text-yellow-500">{error}</div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => {
            const userState = userStates[user._id];
            const truncatedFullName = user.fullName
              .split(' ')
              .slice(0, 7)
              .join(' ') + (user.fullName.split(' ').length > 7 ? '...' : '');

            return (
              <div
                key={user._id}
                className="flex items-center justify-between cursor-pointer hover:bg-gray-200 rounded-lg transition-colors duration-150"
                onClick={(e) => {
                  // Prevent navigation if clicking the follow/unfollow button
                  if ((e.target as HTMLElement).closest('button')) return;
                  window.location.href = `/userprofile/${user.username}`;
                }}
              >
                <div className='flex gap-4 p-3 justify-center items-center flex-grow min-w-0'>
                  <Image
                    width={20}
                    height={20}
                    src={user.profileImageUrl || '/placeholderimg.png'}
                    alt='profile_image'
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>    
                    <p className="font-medium text-gray-900 text-sm">{truncatedFullName}</p>
                    <p className="text-xs text-gray-600">@{user.username}</p>
                    <p className="text-xs text-gray-500">
                      {formatFollowers(userState?.followersCount || user.followersCount)} followers
                    </p>
                  </div>  
                </div>
                <Button
                  size="sm"
                  variant="custom"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollowToggle(user._id);
                  }}
                  disabled={userState?.isLoading}
                  className={`text-xs px-4 py-1 cursor-pointer flex items-center gap-1 mr-1 ${
                    userState?.isFollowing 
                      ? 'bg-gray-500 hover:bg-gray-600 text-white border-gray-500' 
                      : 'bg-button-gradient border-[#FCD45C] text-white hover:bg-[#FCD45C]'
                  }`}
                >
                  {userState?.isLoading ? (
                    <div className="w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : userState?.isFollowing ? (
                    <>
                      <UserMinus className="w-3 h-3" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      Follow
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
