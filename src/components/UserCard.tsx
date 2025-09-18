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
  const currentUser = useUserStore(state => state.user);
  const isCurrentUser = currentUser?._id === user._id;

  // Update local state when user prop changes
  useEffect(() => {
    setIsFollowing(user.isFollowing || false);
    //console.log('UserCard: Setting follow state for user', user._id, 'to', user.isFollowing || false);
  }, [user.isFollowing, user._id]);

  const handleFollowClick = async () => {
    requireAuth(async () => {
      if (isLoading) return;
      
      // Debug check - same as UserProfile
      //console.log('Attempting to follow/unfollow user:', {
      //  targetUserId: user._id,
      //  currentlyFollowing: isFollowing,
      //  token: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false
      // });
      
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
        const status = error.response?.status;
        
        //console.log('Error details:', {
        //  status,
        //  responseMessage,
        //  errorMessage,
        //  currentFollowState: isFollowing
        // });
        
        // Handle specific error cases - these are actually success cases
        if (status === 400) {
          if (responseMessage.includes('Already following') || errorMessage.includes('Already following')) {
            //console.log('Already following - user should see Unfollow button');
            setIsFollowing(true); // User is following, show Unfollow
            onFollow?.(user._id);
          } else if (responseMessage.includes('Not following') || errorMessage.includes('Not following')) {
            //console.log('Not following - user should see Follow button');
            setIsFollowing(false); // User is not following, show Follow
            onFollow?.(user._id);
          } else if (responseMessage.includes('yourself')) {
            alert("You can't follow yourself");
            setIsFollowing(false);
          } else {
            // For other 400 errors, revert the optimistic state (don't use original user prop)
            //console.log('Other 400 error, reverting optimistic state:', responseMessage || errorMessage);
            setIsFollowing(!isFollowing); // Revert the optimistic change
          }
        } else if (status === 409) {
          // Conflict - status already updated, keep optimistic state
          //console.log('Conflict error - keeping optimistic state');
          onFollow?.(user._id);
        } else {
          // For other errors, revert the optimistic state (don't use original user prop)
          //console.log('Reverting optimistic state due to error:', status);
          setIsFollowing(!isFollowing); // Revert the optimistic change
          alert(errorMessage || responseMessage || 'Failed to update follow status');
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
        //console.log('Creating chat with participants:', participants);
        
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
          // Prevent navigation if clicking any button inside
            if ((e.target as HTMLElement).closest('button')) return;
            requireAuth(() => {
              if (isCurrentUser) {
                // Navigate to dedicated self profile route if available
                router.push('/profile');
              } else {
                router.push(`/userprofile/${user.username}`);
              }
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
                <div className="w-14 h-14 rounded-full bg-button-gradient flex items-center justify-center text-black font-semibold text-lg border-2 border-gray-100">
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
                {/* Action Buttons - hide for current logged-in user's own card */}
                {!isCurrentUser && (
                <div className="ml-3 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleFollowClick(); }}
                    disabled={isLoading}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      isFollowing
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                        : "bg-button-gradient text-black hover:bg-blue-700"
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
                </div>
                )}
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