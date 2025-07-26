"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Settings, Pencil, Shield, Check, X, UserPlus, UserMinus } from "lucide-react";
import { Button } from "./ui/button";
import SettingsModal from "./SettingsModal";
import { UserProfile as UserProfileType } from "@/types";
import { followUser, unfollowUser } from "@/api/user";

interface UserProfileProps {
  userData: UserProfileType;
  isCurrentUser?: boolean;
  onProfileUpdate?: (updatedData: Partial<UserProfileType>) => void;
}


const UserProfile = ({ userData, isCurrentUser = false, onProfileUpdate }: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [profile, setProfile] = useState<UserProfileType>(userData);
  const [isFollowing, setIsFollowing] = useState(userData.isFollowing || false);
  const [followersCount, setFollowersCount] = useState(userData.followersCount);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: userData.fullName,
    username: userData.username,
    location: userData.location,
    link: userData.link,
    bio: userData.bio,
    profileImageUrl: userData.profileImageUrl,
  });

  // Update internal state if userData prop changes
  useEffect(() => {
    setProfile(userData);
    setIsFollowing(userData.isFollowing || false);
    setFollowersCount(userData.followersCount);
    setFormData({
      fullName: userData.fullName,
      username: userData.username,
      location: userData.location,
      link: userData.link,
      bio: userData.bio,
      profileImageUrl: userData.profileImageUrl,
    });
  }, [userData]);

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })
    : 'N/A';

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageClick = () => {
    if (!isCurrentUser) return; // Only allow image change for current user
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profileImageUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (onProfileUpdate) {
      onProfileUpdate(formData);
    }
    setIsEditing(false);
    // Update local profile state with new data
    setProfile(prev => ({
      ...prev,
      ...formData
    }));
  };

  const handleCancel = () => {
    // Reset form data to original profile data
    setFormData({
      fullName: profile.fullName,
      username: profile.username,
      location: profile.location,
      link: profile.link,
      bio: profile.bio,
      profileImageUrl: profile.profileImageUrl,
    });
    setIsEditing(false);
  };

  const handleFollowToggle = async () => {
    if (isFollowLoading) return;
    
    // Debug check
    console.log('Attempting to follow/unfollow user:', {
      targetUserId: profile._id,
      currentlyFollowing: isFollowing,
      token: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false
    });
    
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(profile._id);
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        await followUser(profile._id);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Error toggling follow status:', error);
      
      const errorMessage = error.response?.data?.message;
      
      // Handle specific error cases
      if (errorMessage === 'Already following') {
        // Update state to reflect reality
        setIsFollowing(true);
        console.log('User was already following - updating UI state');
      } else if (errorMessage === 'Not following this user') {
        // Update state to reflect reality
        setIsFollowing(false);
        console.log('User was not following - updating UI state');
      } else {
        // Show user-friendly error message for other errors
        alert(errorMessage || 'Failed to update follow status');
        
        // Reset state on other errors
        setIsFollowing(userData.isFollowing || false);
        setFollowersCount(userData.followersCount);
      }
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm min-w-6xl">
      {/* Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-32 w-full relative">
        <div className="absolute -bottom-12 left-6">
          <div className="relative cursor-pointer" onClick={handleImageClick}>
            {profile?.profileImageUrl ? (
              <>
                <Image
                  src={profile.profileImageUrl}
                  alt={profile.fullName}
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-white w-32 h-32 object-cover"
                />
                {isCurrentUser && (
                  <div className="absolute bottom-0 right-0 bg-yellow-500 rounded-full p-1 shadow">
                    <CameraIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-32 h-32 rounded-full border-4 border-white bg-button-gradient flex items-center justify-center text-white font-bold text-2xl">
                  {profile?.fullName ? getInitials(profile.fullName) : 
                   profile?.username ? getInitials(profile.username) : 
                   '?'}
                </div>
                {isCurrentUser && (
                  <div className="absolute bottom-0 right-0 bg-yellow-500 rounded-full p-1 shadow">
                    <CameraIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </>
            )}
            {isCurrentUser && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="pt-16 px-6 pb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 mr-4">
            {/* Name and Username */}
            <div className="flex items-center gap-2 mb-0">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="text-xl font-semibold text-gray-900 border-b-2 border-yellow-300 bg-transparent focus:outline-none focus:border-yellow-500 px-1"
                  placeholder="Your name"
                />
              ) : (
                <h1 className="text-2xl font-semibold text-gray-900">
                  {profile?.fullName}
                </h1>
              )}
              <BadgeCheck className="text-blue-500 w-5 h-5" />
              {profile?.isBusinessProfile && (
                <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                  Business Account <Shield className="w-3 h-3" />
                </span>
              )}
            </div>

            <p className="text-gray-500 text-sm mb-2">{"@" + profile?.username}</p>

            {/* Bio */}
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="w-full mt-2 text-sm text-gray-800 border-2 border-yellow-300 rounded-md p-2 focus:outline-none focus:border-yellow-500 resize-none"
                rows={3}
                placeholder="Tell people about yourself..."
              />
            ) : (
              <p className="mt-2 text-sm text-gray-800">{profile?.bio}</p>
            )}

            {/* Location, Website, Joined */}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 flex-wrap">
              {profile?.location && (
                <div className="flex items-center gap-1">
                  📍
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      className="border-b border-gray-300 bg-transparent focus:outline-none focus:border-yellow-500 px-1"
                      placeholder="Location"
                    />
                  ) : (
                    <span>{profile.location}</span>
                  )}
                </div>
              )}

              {profile?.link && (
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) => handleInputChange("link", e.target.value)}
                      className="text-yellow-700 underline border-b border-gray-300 bg-transparent focus:outline-none focus:border-yellow-500 px-1"
                      placeholder="Website URL"
                    />
                  ) : (
                    <a
                      href={profile.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-yellow-700 underline"
                    >
                      {profile.link}
                    </a>
                  )}
                </div>
              )}

              <div>📅 Joined {joinedDate}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isCurrentUser ? (
              <>
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1.5 rounded-md text-md font-medium flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border px-4 py-1.5 rounded-md text-md font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="border px-4 py-1.5 rounded-md text-md font-medium text-black hover:bg-gray-100 flex items-center gap-1"
                    >
                      <Pencil className="w-4 h-4" /> Edit Profile
                    </Button>
                    <Button
                      onClick={() => setShowSettings(true)}
                      className="border px-2.5 py-1.5 rounded-md text-black hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </>
            ) : (
              <Button
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className={`px-4 py-1.5 rounded-md text-md font-medium flex items-center gap-1 ${
                  isFollowing 
                    ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                {isFollowLoading ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4" /> Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

        {/* Stats */}
        <div className="flex gap-6 mt-6 text-sm text-gray-700 font-medium">
          <span>
            <strong className="text-black">{profile?.followingCount}</strong>{" "}
            Following
          </span>
          <span>
            <strong className="text-black">{followersCount}</strong>{" "}
            Followers
          </span>
          <span>
            <strong className="text-black">{profile?.postsCount || 0}</strong> Posts
          </span>
        </div>
      </div>
    </div>
  );
};

const CameraIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export default UserProfile;