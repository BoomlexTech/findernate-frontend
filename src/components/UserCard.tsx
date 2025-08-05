import { SearchUser } from "@/types";
import Image from "next/image";
import { User, Plus, MessageCircle, MoreVertical, Flag } from "lucide-react";
import { useState, useEffect } from "react";
import { messageAPI } from "@/api/message";
import { followUser, unfollowUser } from "@/api/user";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { AuthDialog } from "@/components/AuthDialog";
import { AxiosError } from "axios";
import ReportModal from './ReportModal';

interface UserCardProps {
  user: SearchUser;
  onFollow?: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onFollow }) => {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const router = useRouter();
  const { requireAuth, showAuthDialog, closeAuthDialog } = useAuthGuard();

  // Update local state when user prop changes
  useEffect(() => {
    setIsFollowing(user.isFollowing || false);
  }, [user.isFollowing]);

  const handleFollowClick = async () => {
    requireAuth(async () => {
      if (isLoading) return;
      
      // Debug check - same as UserProfile
      console.log('Attempting to follow/unfollow user:', {
        targetUserId: user._id,
        currentlyFollowing: isFollowing,
        token: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false
      });
      
      setIsLoading(true);
      try {
        if (isFollowing) {
          await unfollowUser(user._id);
          setIsFollowing(false);
        } else {
          await followUser(user._id);
          setIsFollowing(true);
        }
        
        // Call the optional callback if provided (for parent component updates)
        onFollow?.(user._id);
        
      } catch (error: any) {
        console.error('Error toggling follow status:', error);
        
        const errorMessage = error instanceof Error ? error.message : '';
        const responseMessage = error.response?.data?.message || '';
        
        // Handle specific error cases - same as UserProfile
        if (responseMessage === 'Already following' || errorMessage === 'Already following') {
          setIsFollowing(true);
          console.log('User was already following - updating UI state');
          onFollow?.(user._id);
        } else if (responseMessage === 'Not following this user' || errorMessage === 'Not following this user') {
          setIsFollowing(false);
          console.log('User was not following - updating UI state');  
          onFollow?.(user._id);
        } else {
          // Show user-friendly error message for other errors
          alert(errorMessage || responseMessage || 'Failed to update follow status');
          
          // Reset state on other errors
          setIsFollowing(user.isFollowing || false);
        }
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleMessageClick = async () => {
    requireAuth(async () => {
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
        const participants = [currentUser._id, user._id];
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
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && !(event.target as Element).closest('.relative')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <>
      <div
        className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer"
        onClick={(e) => {
          // Prevent navigation if clicking the follow or message button
          if ((e.target as HTMLElement).closest('button')) return;
          requireAuth(() => {
            router.push(`/userprofile/${user.username}`);
          });
        }}
      >
        {/* Header with profile image and basic info */}
        <div className="p-4 pb-3">
          <div className="flex items-start gap-3">
            {/* Profile Image or Avatar */}
            <div className="flex-shrink-0">
              {user.profileImageUrl ? (
                <Image
                  width={56}
                  height={56}
                  src={user.profileImageUrl}
                  alt={user.username || user.fullName || "User"}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-button-gradient flex items-center justify-center text-white font-semibold text-lg border-2 border-gray-100">
                  {user.fullName ? getInitials(user.fullName) : 
                   user.username ? getInitials(user.username) : 
                   <User size={24} />}
                </div>
              )}
            </div>
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Name */}
                  <h3 className="font-semibold text-gray-900 text-base leading-tight">
                    {user.fullName || user.username || "Unknown User"}
                  </h3>
                  {/* Username (if different from display name) */}
                  {user.username && user.fullName && user.username !== user.fullName && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      @{user.username}
                    </p>
                  )}
                  {/* Professional Title/Description */}
                  {user.bio && (
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {truncateText(user.bio, 80)}
                    </p>
                  )}
                  {/* Location */}
                  {/* {user.location && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <MapPin size={12} className="flex-shrink-0" />
                      <span className="truncate">{user.location}</span>
                    </div>
                  )}  */}
                </div>
                {/* Action Buttons */}
                <div className="ml-3 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleFollowClick(); }}
                    disabled={isLoading}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      isFollowing
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                        : "bg-button-gradient text-white hover:bg-blue-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-md animate-spin" />
                    ) : (
                      <>
                        {!isFollowing && <Plus size={14} />}
                        {isFollowing ? "Following" : "Follow"}
                      </>
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMessageClick(); }}
                    disabled={creatingChat}
                    className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingChat ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-md animate-spin" />
                    ) : (
                      <MessageCircle size={14} />
                    )}
                  </button>
                  
                  {/* More Options */}
                  <div className="relative">
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setShowDropdown(!showDropdown); 
                      }}
                      className="px-2 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    >
                      <MoreVertical size={14} />
                    </button>

                    {showDropdown && (
                      <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowReportModal(true);
                            setShowDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Flag className="w-3 h-3" />
                          Report User
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Dialog */}
      <AuthDialog isOpen={showAuthDialog} onClose={closeAuthDialog} />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="user"
        contentId={user._id}
      />
    </>
  );
};

export default UserCard;