"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Settings, Pencil, Shield, Check, X, UserPlus, UserMinus, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import SettingsModal from "./SettingsModal";
import { UserProfile as UserProfileType } from "@/types";
import { followUser, unfollowUser, editProfile } from "@/api/user";
import { storyAPI } from "@/api/story";
import { Story } from "@/types/story";
import StoryViewer from "./StoryViewer";
import { messageAPI } from "@/api/message";
import { useRouter } from "next/navigation";
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';
import { useUserStore } from "@/store/useUserStore";
import { AxiosError } from "axios";
import FollowersModal from "./FollowersModal";

interface UserProfileProps {
  userData: UserProfileType;
  isCurrentUser?: boolean;
  onProfileUpdate?: (updatedData: Partial<UserProfileType>) => void;
}


const UserProfile = ({ userData, isCurrentUser = false, onProfileUpdate }: UserProfileProps) => {
  const { user: currentUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [profile, setProfile] = useState<UserProfileType>(userData);
  const [isFollowing, setIsFollowing] = useState(userData.isFollowing || false);
  const [followersCount, setFollowersCount] = useState(userData.followersCount);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: userData.fullName,
    username: userData.username,
    location: userData.location,
    link: userData.link,
    bio: userData.bio,
    profileImageUrl: userData.profileImageUrl,
  });
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following'>('followers');

  // Helper function to check if all stories have been viewed by current user
  const areAllStoriesViewed = () => {
    if (!currentUser || !userStories.length) return false;
    
    const allViewed = userStories.every(story => {
      // Safety check: ensure viewers array exists
      if (!story.viewers || !Array.isArray(story.viewers)) {
        return false; // If viewers is undefined/null, treat as unviewed
      }
      return story.viewers.includes(currentUser._id);
    });
    
    console.log('Stories viewed check:', {
      currentUserId: currentUser._id,
      storiesCount: userStories.length,
      allViewed,
      storiesWithViewers: userStories.map(story => ({
        storyId: story._id,
        viewers: story.viewers || [],
        viewedByCurrentUser: story.viewers?.includes(currentUser._id) || false
      }))
    });
    
    return allViewed;
  };

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
    
    // Fetch stories for other users when component loads
    if (!isCurrentUser && userData._id) {
      fetchUserStories(userData._id);
    }
  }, [userData, isCurrentUser]);

  const fetchUserStories = async (userId: string) => {
    try {
      const stories = await storyAPI.fetchStoriesByUser(userId);
      setUserStories(stories);
    } catch (error) {
      console.error('Error fetching user stories:', error);
      setUserStories([]);
    }
  };

  // Debug the createdAt value
  //console.log('Profile createdAt:', profile?.createdAt);

  const getJoinedDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
    } catch (error) {
      console.error('Error parsing date:', error);
      return 'N/A';
    }
  };



  const joinedDate = getJoinedDate(profile?.createdAt);

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

  const handleImageClick = async () => {
    if (isCurrentUser) {
      // For current user, allow image change
      fileInputRef.current?.click();
    } else {
      // For other users, fetch and show their stories
      await fetchAndShowStories();
    }
  };

  const fetchAndShowStories = async () => {
    if (storiesLoading) return;
    
    setStoriesLoading(true);
    try {
      const stories = await storyAPI.fetchStoriesByUser(profile._id);
      setUserStories(stories);
      
      if (stories.length > 0) {
        setShowStoryViewer(true);
      } else {
        // User has no stories
        console.log('User has no stories to show');
      }
    } catch (error) {
      console.error('Error fetching user stories:', error);
    } finally {
      setStoriesLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Utility to crop the image using canvas
  async function getCroppedImg(imageSrc: string, crop: Area): Promise<string> {
    const image = new window.Image();
    image.src = imageSrc;
    await new Promise((resolve) => { image.onload = resolve; });
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
    return canvas.toDataURL('image/jpeg', 0.9);
  }

  const handleCropSave = async () => {
    if (selectedImage && croppedAreaPixels) {
      const croppedImg = await getCroppedImg(selectedImage, croppedAreaPixels);
      setFormData((prev) => ({
        ...prev,
        profileImageUrl: croppedImg,
      }));
      setShowCropper(false);
      setSelectedImage(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedImage(null);
  };

  const handleSave = async () => {
    try {
      // Prepare data for API - only include fields that the API expects
      const profileData = {
        fullName: formData.fullName,
        bio: formData.bio,
        location: formData.location,
        link: formData.link,
        profileImageUrl: formData.profileImageUrl,
      };
      
      // Debug: Log what we're sending to the API
      console.log('Sending profile data to API:', {
        fullName: profileData.fullName,
        bio: profileData.bio,
        location: profileData.location,
        link: profileData.link,
        profileImageUrlLength: profileData.profileImageUrl ? profileData.profileImageUrl.length : 0,
        profileImageUrlStart: profileData.profileImageUrl ? profileData.profileImageUrl.substring(0, 100) : 'No image URL'
      });
      
      // Call the editProfile API
      const updatedProfile = await editProfile(profileData);
      
      // Debug: Log the response
      console.log('API Response:', updatedProfile);
      
      // Update local profile state with the response from API
      setProfile(prev => ({
        ...prev,
        ...updatedProfile
      }));
      
      // Call the parent's onProfileUpdate if provided
      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }
      
      // Exit editing mode
      setIsEditing(false);
      
      // Show success feedback (optional)
      console.log('Profile updated successfully');
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update profile';
      alert(errorMessage);
      
      // Keep editing mode active so user can try again
      // Don't exit editing mode on error
    }
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
      
      const errorMessage = error instanceof Error ? error.message : '';
      
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

  const handleMessageClick = async () => {
    if (creatingChat) return;
    
    setCreatingChat(true);
    try {
      // Get current user from store
      const currentUser = useUserStore.getState().user;
      
      if (!currentUser) {
        alert('Please log in to send messages');
        return;
      }
      
      // Create a direct chat with both users (current user + target user)
      const participants = [currentUser._id, profile._id];
      console.log('Creating chat with participants:', participants);
      
      const chat = await messageAPI.createChat(participants, 'direct');
      
      // Navigate to the chat page with the created chat selected
      router.push(`/chats?chatId=${chat._id}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error creating chat:', axiosError);
      
      if (axiosError.response?.status === 404) {
        alert('Chat functionality is not available on this server yet. Please contact the administrator.');
      } else {
        const errorMessage = axiosError.response?.data as string || 'Failed to create chat';
        alert(errorMessage);
      }
    } finally {
      setCreatingChat(false);
    }
  };

  // Handle followers/following click
  const handleFollowersClick = (tab: 'followers' | 'following') => {
    setFollowersModalTab(tab);
    setShowFollowersModal(true);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm w-full">
      {/* Cropper Modal */}
      {showCropper && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-6 rounded-xl shadow-lg relative w-[90vw] max-w-xs flex flex-col items-center">
            <div className="w-64 h-64 relative bg-gray-100">
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
              />
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleCropCancel}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCropSave}
                className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-32 w-full relative">
        <div className="absolute -bottom-12 left-4 sm:left-6">
          <div className={`relative ${(isCurrentUser && isEditing) || (!isCurrentUser && userStories.length > 0) ? 'cursor-pointer' : ''}`} onClick={(isCurrentUser && isEditing) ? handleImageClick : (!isCurrentUser ? fetchAndShowStories : undefined)}>
            {/* Story ring wrapper for other users with stories */}
            <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full ${
              !isCurrentUser && userStories.length > 0 
                ? areAllStoriesViewed() 
                  ? 'bg-gray-400 p-[3px]'  // Grey for viewed stories
                  : 'bg-gradient-to-r from-yellow-400 to-yellow-600 p-[2px]'  // Yellow gradient for unviewed stories
                : ''
            }`}>
              <div className={`w-full h-full rounded-full ${
                !isCurrentUser && userStories.length > 0 
                  ? 'bg-white p-1' 
                  : ''
              }`}>
                {formData.profileImageUrl ? (
                  <>
                    <Image
                      src={formData.profileImageUrl}
                      alt={profile.fullName}
                      width={128}
                      height={128}
                      className={`rounded-full w-full h-full object-cover ${
                        !isCurrentUser && userStories.length > 0 
                          ? 'border-0' 
                          : 'border-2 sm:border-4 border-white'
                      }`}
                    />
                  </>
                ) : profile?.profileImageUrl ? (
                  <>
                    <Image
                      src={profile.profileImageUrl}
                      alt={profile.fullName}
                      width={128}
                      height={128}
                      className={`rounded-full w-full h-full object-cover ${
                        !isCurrentUser && userStories.length > 0 
                          ? 'border-0' 
                          : 'border-2 sm:border-4 border-white'
                      }`}
                    />
                  </>
                ) : (
                  <>
                    <div className={`w-full h-full rounded-full bg-button-gradient flex items-center justify-center text-white font-bold text-lg sm:text-2xl ${
                      !isCurrentUser && userStories.length > 0 
                        ? 'border-0' 
                        : 'border-2 sm:border-4 border-white'
                    }`}>
                      {profile?.fullName ? getInitials(profile.fullName) : 
                       profile?.username ? getInitials(profile.username) : 
                       '?'}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Camera icon for current user, only when editing */}
            {isCurrentUser && isEditing && (
              <div className="absolute bottom-0 right-0 bg-yellow-500 rounded-full p-1 shadow">
                <CameraIcon className="w-4 h-4 text-white" />
              </div>
            )}
            
            {/* Loading overlay */}
            {storiesLoading && (
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                <div className="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              </div>
            )}
            {isCurrentUser && isEditing && (
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
      <div className="pt-16 px-4 sm:px-6 pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-4">
          <div className="flex-1 w-full sm:mr-4">
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
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
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
              <p className="mt-2 text-sm text-gray-800">
                {profile?.bio || (isCurrentUser ? "Add a bio to tell people about yourself" : null)}
              </p>
            )}

            {/* Location, Website, Email, Joined */}
            <div className="flex items-center gap-3 sm:gap-4 mt-4 text-xs sm:text-sm text-gray-600 flex-wrap">
              {/* Location - TEMPORARILY HIDDEN */}
              {/* {(profile?.location || isEditing) && (
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
                    <span>{profile.location || "No location added"}</span>
                  )}
                </div>
              )} */}

              {/* Website/Link */}
              {(profile?.link || isEditing) && (
                <div className="flex items-center gap-1">
                  🔗
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
                      href={profile.link.startsWith('http') ? profile.link : `https://${profile.link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-yellow-700 underline hover:text-yellow-800"
                    >
                      {profile.link}
                    </a>
                  )}
                </div>
              )}

              {/* Email for current user or if verified - TEMPORARILY HIDDEN */}
              {/* {(isCurrentUser || profile?.isEmailVerified) && profile?.email && (
                <div className="flex items-center gap-1">
                  📧
                  <span className="flex items-center gap-1">
                    {profile.email}
                    {profile.isEmailVerified && (
                      <span className="text-green-600" title="Verified">✓</span>
                    )}
                  </span>
                </div>
              )} */}

              {/* Business Profile Badge */}
              {profile?.isBusinessProfile && (
                <div className="flex items-center gap-1">
                  🏢
                  <span className="text-blue-600 font-medium">Business Profile</span>
                </div>
              )}

              {/* Joined Date */}
              {joinedDate !== 'N/A' && (
                <div className="flex items-center gap-1">
                  📅 Joined {joinedDate}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            {isCurrentUser ? (
              <>
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 sm:px-4 py-1.5 rounded-md text-sm sm:text-md font-medium flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> <span className="hidden sm:inline">Save</span>
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border px-3 sm:px-4 py-1.5 rounded-md text-sm sm:text-md font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> <span className="hidden sm:inline">Cancel</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="border px-3 sm:px-4 py-1.5 rounded-md text-sm sm:text-md font-medium text-black hover:bg-gray-100 flex items-center gap-1"
                    >
                      <Pencil className="w-4 h-4" /> <span className="hidden sm:inline">Edit Profile</span>
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
              <>
                <Button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={`px-3 sm:px-4 py-1.5 rounded-md text-sm sm:text-md font-medium flex items-center gap-1 ${
                    isFollowing 
                      ? 'bg-gray-500 hover:bg-gray-600 text-white border-gray-500' 
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }`}
                >
                  {isFollowLoading ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" /> <span className="hidden sm:inline">Unfollow</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> <span className="hidden sm:inline">Follow</span>
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleMessageClick}
                  disabled={creatingChat}
                  variant="outline"
                  className="border px-3 sm:px-4 py-1.5 rounded-md text-sm sm:text-md font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-1"
                >
                  {creatingChat ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <MessageCircle className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{creatingChat ? 'Creating...' : 'Message'}</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}


        {/* Stats */}
        <div className="flex gap-4 sm:gap-6 mt-6 text-sm text-gray-700 font-medium flex-wrap">
          <button
            onClick={() => handleFollowersClick('following')}
            className="hover:text-yellow-600 transition-colors cursor-pointer"
          >
            <strong className="text-black">{profile?.followingCount}</strong>{" "}
            Following
          </button>
          <button
            onClick={() => handleFollowersClick('followers')}
            className="hover:text-yellow-600 transition-colors cursor-pointer"
          >
            <strong className="text-black">{followersCount}</strong>{" "}
            Followers
          </button>
          <span>
            <strong className="text-black">{profile?.postsCount || 0}</strong> Posts
          </span>
        </div>
      </div>

      {/* Story Viewer Modal */}
      {showStoryViewer && userStories.length > 0 && (
        <StoryViewer
          storyUser={{
            _id: profile._id,
            username: profile.username,
            profileImageUrl: profile.profileImageUrl,
            stories: userStories,
            hasNewStories: true,
            isCurrentUser: false,
          }}
          initialStoryIndex={0}
          allStoryUsers={[{
            _id: profile._id,
            username: profile.username,
            profileImageUrl: profile.profileImageUrl,
            stories: userStories,
            hasNewStories: true,
            isCurrentUser: false,
          }]}
          onClose={() => setShowStoryViewer(false)}
          onStoryViewed={(storyId) => {
            // Mark story as viewed
            console.log('Story viewed:', storyId);
          }}
        />
      )}

      {/* Followers Modal */}
      <FollowersModal
        userId={profile._id}
        username={profile.username}
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        initialTab={followersModalTab}
      />
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