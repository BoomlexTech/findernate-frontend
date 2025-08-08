'use client';

import { Heart, MessageCircle, MapPin, ChevronLeft, ChevronRight, MoreVertical, Bookmark, BookmarkCheck, Flag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FeedPost, SavedPostsResponse } from '@/types';
import formatPostDate from '@/utils/formatDate';
import { useState, useEffect } from 'react';
import ServiceCard from './post-window/ServiceCard';
import { Badge } from './ui/badge';
import ProductCard from './post-window/ProductCard';
import BusinessPostCard from './post-window/BusinessCard';
import { likePost, unlikePost, savePost, unsavePost, getSavedPost, deletePost } from '@/api/post';
//import { createComment } from '@/api/comment';
import { postEvents } from '@/utils/postEvents';
import { AxiosError } from 'axios';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { AuthDialog } from '@/components/AuthDialog';
import CommentDrawer from './CommentDrawer';
import ReportModal from './ReportModal';
import ImageModal from './ImageModal';

export interface PostCardProps {
  post: FeedPost;
  onPostDeleted?: (postId: string) => void; // Optional callback for when post is deleted
  onPostClick?: () => void; // Optional callback for when post is clicked
  showComments?: boolean; // Whether to display comments inline
}

export default function PostCard({ post, onPostDeleted, onPostClick, showComments = false }: PostCardProps) {
  const pathname = usePathname();
  const { requireAuth, showAuthDialog, closeAuthDialog } = useAuthGuard();
  
  const [profileImageError, setProfileImageError] = useState(false);
  const [mediaImageError, setMediaImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLikedBy);
  const [likesCount, setLikesCount] = useState(post.engagement.likes);
  const [commentsCount, setCommentsCount] = useState(post.engagement.comments);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  // const [comment, setComment] = useState('');
  // const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPostSaved, setIsPostSaved] = useState(false);
  const [checkingSaved, setCheckingSaved] = useState(true);
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOnProfilePage, setIsOnProfilePage] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Check if we're on a profile page to show delete button
  useEffect(() => {
    setIsOnProfilePage(pathname.includes('/profile') || pathname.includes('/userprofile'));
  }, [pathname]);

  // Sync local state with prop changes (important for page refreshes)
  useEffect(() => {
    setIsLiked(post.isLikedBy);
    setLikesCount(post.engagement.likes);
    
    // Use actual comments array length if available, otherwise use engagement count
    const actualCommentsCount = post.comments && Array.isArray(post.comments) 
      ? post.comments.length 
      : post.engagement.comments;
    setCommentsCount(actualCommentsCount);
    
    console.log(`PostCard ${post._id} - Setting comments count to ${actualCommentsCount} (from ${post.comments ? 'comments array' : 'engagement'})`);
  }, [post.isLikedBy, post.engagement.likes, post.engagement.comments, post.comments]);

  // Reset media index when post changes
  useEffect(() => {
    setCurrentMediaIndex(0);
    setMediaImageError(false);
  }, [post._id]);

  // Reset media error when media index changes
  useEffect(() => {
    setMediaImageError(false);
  }, [currentMediaIndex]);

  // Set client-side flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // For debugging - log the initial state including comments
  useEffect(() => {
    console.log(`PostCard loaded for post ${post._id}: isLikedBy=${post.isLikedBy}, likes=${post.engagement.likes}, comments=${post.engagement.comments}`);
    console.log(`PostCard comments array:`, post.comments);
    console.log(`PostCard showComments prop:`, showComments);
  }, [post._id, post.comments, showComments]);

  // Load like status and comment count from localStorage on component mount (for persistence across refreshes)
  // Skip this on individual post pages since the page level handles localStorage
  useEffect(() => {
    if (!hasRefreshed && isClient && !pathname.includes('/post/')) {
      const savedLikeStatus = localStorage.getItem(`post_like_${post._id}`);
      const savedLikesCount = localStorage.getItem(`post_likes_count_${post._id}`);
      const savedCommentsCount = localStorage.getItem(`post_comments_count_${post._id}`);
      
      if (savedLikeStatus !== null) {
        const isLikedFromStorage = savedLikeStatus === 'true';
        const likesCountFromStorage = savedLikesCount ? parseInt(savedLikesCount) : post.engagement.likes;
        
        console.log(`Loading like status from localStorage for post ${post._id}: isLiked=${isLikedFromStorage}, count=${likesCountFromStorage}`);
        setIsLiked(isLikedFromStorage);
        setLikesCount(likesCountFromStorage);
      }
      
      if (savedCommentsCount !== null) {
        const commentsCountFromStorage = parseInt(savedCommentsCount);
        // Only use saved count if it's higher than the server count (to account for new comments)
        if (commentsCountFromStorage > post.engagement.comments) {
          console.log(`Loading comment count from localStorage for post ${post._id}: ${commentsCountFromStorage}`);
          setCommentsCount(commentsCountFromStorage);
        }
      }
      
      setHasRefreshed(true);
    }
  }, [post._id, hasRefreshed, isClient]);

  // Listen for comment count changes from other tabs/components
  useEffect(() => {
    const cleanup = postEvents.on(post._id, 'commentCountChange', (newCount: number) => {
      console.log(`Comment count updated for post ${post._id}: ${newCount}`);
      setCommentsCount(newCount);
    });

    return cleanup;
  }, [post._id]);

  // Handle keyboard navigation for media carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (post.media.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        setCurrentMediaIndex((prev) => 
          prev > 0 ? prev - 1 : post.media.length - 1
        );
      } else if (e.key === 'ArrowRight') {
        setCurrentMediaIndex((prev) => 
          prev < post.media.length - 1 ? prev + 1 : 0
        );
      }
    };

    // Only add listener when hovering over the media
    const mediaElement = document.querySelector(`[data-post-id="${post._id}"] .post-media`);
    if (mediaElement) {
      const handleMouseEnter = () => document.addEventListener('keydown', handleKeyDown);
      const handleMouseLeave = () => document.removeEventListener('keydown', handleKeyDown);
      
      mediaElement.addEventListener('mouseenter', handleMouseEnter);
      mediaElement.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        mediaElement.removeEventListener('mouseenter', handleMouseEnter);
        mediaElement.removeEventListener('mouseleave', handleMouseLeave);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [post._id, post.media.length]);

  const handleLikeToggle = async () => {
    requireAuth(async () => {
      if (isLoading) return;
      
      console.log(`=== LIKE TOGGLE START for post ${post._id} ===`);
      console.log(`Current state - isLiked: ${isLiked}, likesCount: ${likesCount}`);
      
      setIsLoading(true);
      const previousIsLiked = isLiked;
      const previousLikesCount = likesCount;
      
      // Determine the action BEFORE updating state
      const shouldLike = !isLiked;
      console.log(`Action determined: ${shouldLike ? 'LIKE' : 'UNLIKE'}`);

      // Optimistic update
      const newLikesCount = shouldLike ? likesCount + 1 : likesCount - 1;
      setIsLiked(shouldLike);
      setLikesCount(newLikesCount);
      
      // Save to localStorage for persistence
      if (isClient) {
        localStorage.setItem(`post_like_${post._id}`, shouldLike.toString());
        localStorage.setItem(`post_likes_count_${post._id}`, newLikesCount.toString());
      }
      
      console.log(`Optimistic update - new isLiked: ${shouldLike}, new likesCount: ${newLikesCount}`);

      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 15000)
        );

        if (shouldLike) {
          console.log(`Liking post ${post._id}`);
          try {
            await Promise.race([likePost(post._id), timeoutPromise]);
            console.log(`Successfully liked post ${post._id}`);
          } catch (likeError) {
            // Handle "already liked" error
            const axiosError = likeError as AxiosError;
            console.log('Like error details:', {
              error: likeError,
              responseData: axiosError?.response?.data,
              responseStatus: axiosError?.response?.status,
              code: axiosError?.code
            });
            
            if (axiosError?.response?.status === 409) {
              console.log(`Post ${post._id} already liked - treating as successful like`);
              // Don't revert the optimistic update since the post is effectively "liked"
              return;
            }
            // Re-throw other errors to be handled by outer catch
            throw likeError;
          }
        } else {
          console.log(`Unliking post ${post._id}`);
          try {
            await Promise.race([unlikePost(post._id), timeoutPromise]);
            console.log(`Successfully unliked post ${post._id}`);
          } catch (unlikeError) {
            // Handle specific "Like not found" error or timeout
            const axiosError = unlikeError as AxiosError;
            const errorMessage = (unlikeError as Error)?.message;
            
            console.log('Unlike error details:', {
              error: unlikeError,
              axiosError: axiosError,
              errorMessage: errorMessage,
              responseData: axiosError?.response?.data,
              responseStatus: axiosError?.response?.status,
              code: axiosError?.code
            });
            
            if ((axiosError?.response?.data as any)?.message === 'Like not found for this post' || 
                errorMessage?.includes('timeout') ||
                axiosError?.code === 'ECONNABORTED') {
              console.log(`Unlike failed (${errorMessage || 'Like not found'}) - treating as successful unlike`);
              // Don't revert the optimistic update since the post is effectively "unliked"
              return;
            }
            // Re-throw other errors to be handled by outer catch
            throw unlikeError;
          }
        }
      } catch (error) {
        // Revert optimistic update on error
        const axiosError = error as AxiosError;
        const errorMessage = (error as Error)?.message;
        
        console.error(`Error ${shouldLike ? 'liking' : 'unliking'} post:`, error);
        console.error('Error details:', axiosError?.response?.data || errorMessage);
        console.error('Full error object:', error);
        setIsLiked(previousIsLiked);
        setLikesCount(previousLikesCount);
        
        // Revert localStorage as well
        if (isClient) {
          localStorage.setItem(`post_like_${post._id}`, previousIsLiked.toString());
          localStorage.setItem(`post_likes_count_${post._id}`, previousLikesCount.toString());
        }
      } finally {
        console.log(`=== LIKE TOGGLE END - Expected final state: isLiked: ${shouldLike}, loading: false ===`);
        setIsLoading(false);
      }
    });
  };

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => 
      prev > 0 ? prev - 1 : post.media.length - 1
    );
  };

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => 
      prev < post.media.length - 1 ? prev + 1 : 0
    );
  };

  // Touch handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && post.media.length > 1) {
      handleNextMedia({ stopPropagation: () => {} } as React.MouseEvent);
    }
    if (isRightSwipe && post.media.length > 1) {
      handlePrevMedia({ stopPropagation: () => {} } as React.MouseEvent);
    }
  };

  const handlePostClick = (e: React.MouseEvent) => {
    // Check if we're already on a post page (single post view)
    if (pathname.includes('/post/')) {
      return; // Don't open new tab if already on post page
    }
    
    // Prevent opening if clicking on interactive elements or modal content
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input') || 
        target.closest('.fixed') || target.closest('[role="dialog"]') || 
        target.classList.contains('fixed')) {
      return;
    }
    
    // Require authentication before opening post
    requireAuth(() => {
      // If onPostClick prop is provided, use it (for search page)
      if (onPostClick) {
        onPostClick();
      } else {
        // Default behavior: open image modal
        setShowImageModal(true);
      }
    });
  };

  // const handleCommentSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   requireAuth(async () => {
  //     if (!comment.trim() || isSubmittingComment) return;
      
  //     setIsSubmittingComment(true);
  //     try {
  //       console.log(`Adding comment to post ${post._id}:`, comment);
        
  //       // Call the actual API to create comment
  //       const newComment = await createComment({
  //         postId: post._id,
  //         content: comment.trim()
  //       });
        
  //       console.log('Comment created successfully:', newComment);
        
  //       // Update comments count optimistically and clear input
  //       const newCount = commentsCount + 1;
  //       setCommentsCount(newCount);
  //       setComment('');
        
  //       // Save the updated comment count to localStorage for persistence
  //       if (isClient) {
  //         localStorage.setItem(`post_comments_count_${post._id}`, newCount.toString());
  //       }
        
  //       // Emit event for comment count change to sync across components
  //       postEvents.emit(post._id, 'commentCountChange', newCount);
        
  //       // Note: The backend automatically updates the post's comment count
  //       // The saved count will persist until the server provides a higher count
        
  //     } catch (error: any) {
  //       console.error('Error adding comment:', error);
        
  //       // Revert the comment count on error
  //       setCommentsCount(commentsCount);
  //       if (isClient) {
  //         localStorage.setItem(`post_comments_count_${post._id}`, commentsCount.toString());
  //       }
        
  //       // Show user-friendly error message
  //       const errorMessage = error?.response?.data?.message || 'Failed to add comment. Please try again.';
  //       alert(errorMessage);
  //     } finally {
  //       setIsSubmittingComment(false);
  //     }
  //   });
  // };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    requireAuth(() => {
      // If we're on a single post page, focus on the existing comments section instead of opening drawer
      if (pathname.includes('/post/')) {
        // Find and focus the comments section on the page
        const commentsSection = document.querySelector('[data-comments-section]');
        if (commentsSection) {
          commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Focus on the comment input if it exists
          const commentInput = commentsSection.querySelector('textarea, input[type="text"]') as HTMLElement;
          if (commentInput) {
            setTimeout(() => commentInput.focus(), 300); // Small delay for smooth scroll
          }
        }
      } else {
        // On home page or other pages, show the comment drawer
        setShowCommentDrawer(true);
      }
    });
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    requireAuth(() => {
      // Implement your share functionality here
      console.log('Share post:', post._id);
      
      // Example: Copy link to clipboard
      if (navigator.share) {
        navigator.share({
          title: `Check out this post by ${post.username || post.userId?.username}`,
          text: post.caption,
          url: `${window.location.origin}/post/${post._id}`
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
        alert('Link copied to clipboard!');
      }
    });
  };

  const handleToggleSavePost = async () => {
    requireAuth(async () => {
      if (isSaving) return;
      
      setIsSaving(true);
      const previousSavedState = isPostSaved;
      
      try {
        if (isPostSaved) {
          console.log(`Unsaving post ${post._id}`);
          await unsavePost(post._id);
          setIsPostSaved(false);
          
          // Update cache
          updateSavedPostsCache(post._id, false);
          
          console.log('Post unsaved successfully');
          alert('Post removed from saved!');
        } else {
          console.log(`Saving post ${post._id}`);
          await savePost(post._id);
          setIsPostSaved(true);
          
          // Update cache
          updateSavedPostsCache(post._id, true);
          
          console.log('Post saved successfully');
          alert('Post saved successfully!');
        }
        setShowDropdown(false);
      } catch (error) {
        console.error('Error toggling save status:', error);
        setIsPostSaved(previousSavedState); // Revert state on error
        alert(`Error ${isPostSaved ? 'removing' : 'saving'} post. Please try again.`);
      } finally {
        setIsSaving(false);
      }
    });
  };

  // Helper function to update cached saved posts
  const updateSavedPostsCache = (postId: string, isSaved: boolean) => {
    try {
      const cacheKey = 'saved_posts_cache';
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        let savedPostIds: string[] = JSON.parse(cachedData);
        
        if (isSaved && !savedPostIds.includes(postId)) {
          savedPostIds.push(postId);
        } else if (!isSaved) {
          savedPostIds = savedPostIds.filter(id => id !== postId);
        }
        
        localStorage.setItem(cacheKey, JSON.stringify(savedPostIds));
      }
    } catch (error) {
      console.error('Error updating cache:', error);
    }
  };

  const handleDeletePost = async () => {
    requireAuth(async () => {
      if (isDeleting) return;
      
      const confirmDelete = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
      if (!confirmDelete) return;
      
      setIsDeleting(true);
      try {
        console.log(`Deleting post ${post._id}`);
        await deletePost(post._id);
        
        console.log('Post deleted successfully');
        setShowDropdown(false);
        
        // Call the callback if provided to remove from UI
        if (onPostDeleted) {
          onPostDeleted(post._id);
        }
        
        alert('Post deleted successfully!');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    });
  };

  const handleReportPost = () => {
    requireAuth(() => {
      setShowReportModal(true);
      setShowDropdown(false);
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && !(event.target as Element).closest('.dropdown-menu')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Check if post is saved on component mount
  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        // Check cache first (cache for 2 minutes)
        const cacheKey = 'saved_posts_cache';
        const cacheTimeKey = 'saved_posts_cache_time';
        const cacheTime = localStorage.getItem(cacheTimeKey);
        const currentTime = Date.now();
        const cacheExpiry = 2 * 60 * 1000; // 2 minutes

        let savedPostIds: string[] = [];

        if (cacheTime && (currentTime - parseInt(cacheTime)) < cacheExpiry) {
          // Use cached data
          const cachedData = localStorage.getItem(cacheKey);
          if (cachedData) {
            savedPostIds = JSON.parse(cachedData);
          }
        } else {
          // Fetch fresh data and cache it
          const response: SavedPostsResponse = await getSavedPost();
          savedPostIds = response.data.savedPosts
            .filter(savedPost => savedPost.postId?._id)
            .map(savedPost => savedPost.postId!._id);
          
          localStorage.setItem(cacheKey, JSON.stringify(savedPostIds));
          localStorage.setItem(cacheTimeKey, currentTime.toString());
        }

        // Check if current post ID exists in saved posts
        const isCurrentPostSaved = savedPostIds.includes(post._id);
        setIsPostSaved(isCurrentPostSaved);
      } catch (error) {
        console.error('Error checking saved status:', error);
        setIsPostSaved(false);
      } finally {
        setCheckingSaved(false);
      }
    };

    if (isClient) {
      checkSavedStatus();
    }
  }, [post._id, isClient]);

  // Don't render if essential post data is missing
  if (!post || !post._id || !post.media || post.media.length === 0) {
    console.warn('PostCard: Essential post data missing', { post: post?._id, hasMedia: post?.media?.length > 0 });
    return null;
  }

  return (
    <div className="relative">
      <div 
        className={`w-full bg-white ${showCommentDrawer ? 'rounded-t-3xl shadow-none border-b-0' : 'rounded-3xl shadow-sm'} border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 relative ${
          pathname.includes('/post/') ? 'cursor-default' : 'cursor-pointer'
        }`}
        onClick={handlePostClick}
        data-post-id={post._id}
      >
        {/* Desktop Layout: Media + Info Side-by-Side | Mobile Layout: Stacked */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 p-3">
          
          {/* Mobile: User Profile and Name with Location (Top Section) */}
          <div className="md:hidden flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  requireAuth(() => {
                    window.open(`/userprofile/${post.username || post.userId?.username}`, '_blank');
                  });
                }}
                className="cursor-pointer"
              >
                <Image
                  width={40}
                  height={40}
                  src={
                    profileImageError || !post.profileImageUrl
                      ? '/placeholderimg.png'
                      : post.profileImageUrl
                  }
                  alt={(post.username || post.userId?.username) || 'User Profile Image'}
                  className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity"
                  onError={() => setProfileImageError(true)}
                />
              </div>
              <div>
                <div className='flex gap-2 items-center'>
                  <h3 
                    className="font-semibold text-gray-900 cursor-pointer hover:text-yellow-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      requireAuth(() => {
                        window.open(`/userprofile/${post.username || post.userId?.username}`, '_blank');
                      });
                    }}
                  >
                    {post.username || post.userId?.username || 'No Username'}
                  </h3>
                  {post.contentType && <Badge className='bg-button-gradient' variant='outline'>{post.contentType}</Badge>}
                </div>
                {post.location && (
                  <div className="flex items-center gap-1 text-gray-700">
                    <MapPin className="w-3 h-3 text-yellow-500" />
                    <p className="text-xs">
                      {typeof post.location === 'object' ? 
                        (post.location.name || 
                         (post.location as any).label || 
                         (post.location as any).address || 
                         String(post.location))
                        : 
                        String(post.location)
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: Three Dot Menu */}
            <div className="relative dropdown-menu">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSavePost();
                    }}
                    disabled={isSaving || checkingSaved}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                  >
                    {checkingSaved ? (
                      <>
                        <Bookmark className="w-4 h-4" />
                        Checking...
                      </>
                    ) : isPostSaved ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 text-yellow-600" />
                        {isSaving ? 'Removing...' : 'Unsave'}
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </>
                    )}
                  </button>
                  
                  {/* Delete button - only show on profile pages */}
                  {isOnProfilePage && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePost();
                      }}
                      disabled={isDeleting}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReportPost();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Business/Service/Product Details - Mobile Only (Before Media) */}
          <div className="md:hidden mb-2">
            {post.contentType === 'service' && <ServiceCard post={post} />}
            {post.contentType === 'product' && <ProductCard post={post} />}
            {post.contentType === 'business' && <BusinessPostCard post={post} />}
          </div>

          {/* Media Section */}
          <div 
            className="post-media relative w-full h-[300px] sm:h-[350px] md:w-[21rem] md:h-[24rem] md:flex-shrink-0 overflow-hidden rounded-2xl group"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Current Media Display */}
            {post.media[currentMediaIndex]?.type === 'video' ? (
              <video
                className="w-full h-full object-cover rounded-xl"
                poster={post.media[currentMediaIndex]?.thumbnailUrl}
                muted
                loop
                style={{ objectFit: 'cover' }}
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => e.currentTarget.pause()}
              >
                <source src={post.media[currentMediaIndex]?.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <Image
                src={mediaImageError ? '/placeholderimg.png' : (post.media[currentMediaIndex]?.url || post.media[0]?.url || '/placeholderimg.png')}
                alt="Post content"
                fill
                className="rounded-xl object-cover"
                unoptimized
                onError={() => {
                  console.warn('Media image failed to load for post:', post._id, 'URL:', post.media[currentMediaIndex]?.url);
                  setMediaImageError(true);
                }}
              />
            )}

            {/* Navigation Controls - Only show if more than 1 media item */}
            {post.media.length > 1 && (
              <>
                {/* Previous Button */}
                <button
                  onClick={handlePrevMedia}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Next Button */}
                <button
                  onClick={handleNextMedia}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Media Count Indicator */}
                <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {currentMediaIndex + 1} / {post.media.length}
                </div>

                {/* Dots Indicator */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {post.media.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentMediaIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentMediaIndex 
                          ? 'bg-white' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Desktop: Profile + Info - Hidden on mobile */}
          <div className="hidden md:flex flex-col justify-start flex-1 space-y-1 relative pb-16">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    requireAuth(() => {
                      window.open(`/userprofile/${post.username || post.userId?.username}`, '_blank');
                    });
                  }}
                  className="cursor-pointer"
                >
                  <Image
                    width={40}
                    height={40}
                    src={
                      profileImageError || !post.profileImageUrl
                        ? '/placeholderimg.png'
                        : post.profileImageUrl
                    }
                    alt={(post.username || post.userId?.username) || 'User Profile Image'}
                    className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity"
                    onError={() => setProfileImageError(true)}
                  />
                </div>
                <div>
                    <div className='flex gap-2'>
                  <h3 
                    className="font-semibold text-gray-900 cursor-pointer hover:text-yellow-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      requireAuth(() => {
                        window.open(`/userprofile/${post.username || post.userId?.username}`, '_blank');
                      });
                    }}
                  >
                    {post.username || post.userId?.username || 'No Username'}
                  </h3>
                  {post.contentType && <Badge className='bg-button-gradient' variant='outline'>{post.contentType}</Badge>}
                    </div>
                {post.location && (
                <div className="flex items-center gap-1 text-gray-700">
                  <MapPin className="w-3 h-3 text-yellow-500" />
                  <p className="text-xs">
                    {typeof post.location === 'object' ? 
                      (post.location.name || 
                       (post.location as any).label || 
                       (post.location as any).address || 
                       String(post.location))
                      : 
                      String(post.location)
                    }
                  </p>
                </div>
                  )}
                </div>
              </div>

              {/* Desktop: Three Dot Menu */}
              <div className="relative dropdown-menu">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSavePost();
                      }}
                      disabled={isSaving || checkingSaved}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                    >
                      {checkingSaved ? (
                        <>
                          <Bookmark className="w-4 h-4" />
                          Checking...
                        </>
                      ) : isPostSaved ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 text-yellow-600" />
                          {isSaving ? 'Removing...' : 'Unsave'}
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </>
                      )}
                    </button>
                    
                    {/* Delete button - only show on profile pages */}
                    {isOnProfilePage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost();
                        }}
                        disabled={isDeleting}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReportPost();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Flag className="w-4 h-4" />
                      Report
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-900 leading-relaxed">{post.caption}</p>

            {/* Desktop: Business/Service/Product Details */}
            {post.contentType === 'service' && <ServiceCard post={post} />}
            {post.contentType === 'product' && <ProductCard post={post} />}
            {post.contentType === 'business' && <BusinessPostCard post={post} />}

            {/* Desktop: Hashtags */}
            <div className="px-1 pb-2">
              <div className="flex flex-wrap gap-2">
                {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && post.tags.map((tag, index) => (
                  <span key={index} className='text-yellow-600'>
                    #{typeof tag === 'string' ? tag : String(tag)}
                  </span>
                ))}
              </div>
            </div>

            {/* Comment Box - Only show for normal/regular posts and not on single post pages */}
            {/* {(!post.contentType || post.contentType === 'normal' || post.contentType === 'regular') && !pathname.includes('/post/') && (
              <div className="px-2 -mb-5 mt-auto">
                <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-full border border-yellow-200 px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full py-2 px-4 text-sm bg-transparent border-none focus:outline-none text-gray-800 placeholder-gray-500 font-medium"
                      disabled={isSubmittingComment}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!comment.trim() || isSubmittingComment}
                    className={`flex items-center justify-center p-2 rounded-full transition-all duration-200 ${
                      comment.trim() && !isSubmittingComment
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmittingComment ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <MessageCircle className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            )} */}

            {/* Desktop: Engagement buttons and timestamp - inside info panel */}
            <div className="px-1 sm:px-2 py-1 absolute bottom-0 w-full pr-20 sm:pr-24">
              <div className="flex items-center">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <button 
                    onClick={handleLikeToggle}
                    disabled={isLoading}
                    className={`flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 rounded-lg transition-colors ${
                      isLiked 
                        ? 'text-red-500' 
                        : 'text-gray-600 hover:text-red-500'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-xs sm:text-sm font-medium">{likesCount}</span>
                  </button>
                  <button 
                    onClick={handleCommentClick}
                    className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-gray-100 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm font-medium">{commentsCount || 0}</span>
                  </button>
                  <button 
                    onClick={handleShareClick}
                    className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 rounded-lg text-gray-600 hover:text-green-500 hover:bg-gray-100 transition-colors"
                  >
                    <Image 
                      src="/reply.png" 
                      alt="Share" 
                      width={20} 
                      height={20} 
                      className="w-4 h-4 sm:w-5 sm:h-5"
                    />
                    <span className="text-xs sm:text-sm font-medium hidden xs:inline">{post.engagement.shares || 0}</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Desktop: Timestamp */}
            <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 text-xs text-gray-500">
              <p className="text-xs text-gray-700 p-1 sm:p-2 whitespace-nowrap">{formatPostDate(post.createdAt)}</p>
            </div>
          </div>

          {/* Mobile: Content Below Media */}
          <div className="md:hidden space-y-2">
            {/* Mobile: Caption */}
            <p className="text-gray-900 leading-relaxed text-sm">{post.caption}</p>

            {/* Mobile: Hashtags */}
            {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {post.tags.map((tag, index) => (
                  <span key={index} className='text-yellow-600 text-sm'>
                    #{typeof tag === 'string' ? tag : String(tag)}
                  </span>
                ))}
              </div>
            )}

            {/* Mobile: Engagement Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleLikeToggle}
                  disabled={isLoading}
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                    isLiked 
                      ? 'text-red-500' 
                      : 'text-gray-600 hover:text-red-500'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{likesCount}</span>
                </button>
                <button 
                  onClick={handleCommentClick}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-gray-100 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{commentsCount || 0}</span>
                </button>
                <button 
                  onClick={handleShareClick}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-green-500 hover:bg-gray-100 transition-colors"
                >
                  <Image 
                    src="/reply.png" 
                    alt="Share" 
                    width={20} 
                    height={20} 
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium">{post.engagement.shares || 0}</span>
                </button>
              </div>
              
              {/* Mobile: Timestamp */}
              <p className="text-xs text-gray-500">{formatPostDate(post.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
      
     
      
      {/* Comment Drawer - positioned directly attached to post card */}
      {showCommentDrawer && (
        <CommentDrawer 
          isOpen={showCommentDrawer}
          onClose={() => setShowCommentDrawer(false)}
          post={post}
        />
      )}
      
      {/* Auth Dialog */}
      <AuthDialog isOpen={showAuthDialog} onClose={closeAuthDialog} />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="post"
        contentId={post._id}
      />

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        post={post}
      />
    </div>
  );
}