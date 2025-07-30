'use client';

import { Heart, MessageCircle, Share2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'; //Phone
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FeedPost } from '@/types';
// import { Button } from './ui/button';
import formatPostDate from '@/utils/formatDate';
import { useState, useEffect } from 'react';
import ServiceCard from './post-window/ServiceCard';
import { Badge } from './ui/badge';
import ProductCard from './post-window/ProductCard';
import BusinessPostCard from './post-window/BusinessCard';
import { likePost, unlikePost } from '@/api/post';
import { createComment } from '@/api/comment';
import { postEvents } from '@/utils/postEvents';

export interface PostCardProps {
  post: FeedPost;
}

export default function PostCard({ post }: PostCardProps) {
  const pathname = usePathname();
  const [profileImageError, setProfileImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLikedBy);
  const [likesCount, setLikesCount] = useState(post.engagement.likes);
  const [commentsCount, setCommentsCount] = useState(post.engagement.comments);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Sync local state with prop changes (important for page refreshes)
  useEffect(() => {
    setIsLiked(post.isLikedBy);
    setLikesCount(post.engagement.likes);
    setCommentsCount(post.engagement.comments);
  }, [post.isLikedBy, post.engagement.likes, post.engagement.comments]);

  // Reset media index when post changes
  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [post._id]);


  // Set client-side flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // For debugging - log the initial state including comments
  useEffect(() => {
    console.log(`PostCard loaded for post ${post._id}: isLikedBy=${post.isLikedBy}, likes=${post.engagement.likes}, comments=${post.engagement.comments}`);
  }, [post._id]);

  // Load like status and comment count from localStorage on component mount (for persistence across refreshes)
  useEffect(() => {
    if (!hasRefreshed && isClient) {
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
  }, [post._id, post.engagement.likes, post.engagement.comments, hasRefreshed, isClient]);

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
        } catch (likeError: any) {
          // Handle "already liked" error
          if (likeError?.response?.status === 409) {
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
        } catch (unlikeError: any) {
          // Handle specific "Like not found" error or timeout
          if (unlikeError?.response?.data?.message === 'Like not found for this post' || 
              unlikeError?.message?.includes('timeout') ||
              unlikeError?.code === 'ECONNABORTED') {
            console.log(`Unlike failed (${unlikeError?.message || 'Like not found'}) - treating as successful unlike`);
            // Don't revert the optimistic update since the post is effectively "unliked"
            return;
          }
          // Re-throw other errors to be handled by outer catch
          throw unlikeError;
        }
      }
    } catch (error: any) {
      // Revert optimistic update on error
      console.error(`Error ${shouldLike ? 'liking' : 'unliking'} post:`, error);
      console.error('Error details:', error?.response?.data || error?.message);
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
    
    // Prevent opening if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) {
      return;
    }
    
    // Open post page in new tab with only post ID
    window.open(`/post/${post._id}`, '_blank');
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    try {
      console.log(`Adding comment to post ${post._id}:`, comment);
      
      // Call the actual API to create comment
      const newComment = await createComment({
        postId: post._id,
        content: comment.trim()
      });
      
      console.log('Comment created successfully:', newComment);
      
      // Update comments count optimistically and clear input
      const newCount = commentsCount + 1;
      setCommentsCount(newCount);
      setComment('');
      
      // Save the updated comment count to localStorage for persistence
      if (isClient) {
        localStorage.setItem(`post_comments_count_${post._id}`, newCount.toString());
      }
      
      // Emit event for comment count change to sync across components
      postEvents.emit(post._id, 'commentCountChange', newCount);
      
      // Note: The backend automatically updates the post's comment count
      // The saved count will persist until the server provides a higher count
      
    } catch (error: any) {
      console.error('Error adding comment:', error);
      
      // Revert the comment count on error
      setCommentsCount(commentsCount);
      if (isClient) {
        localStorage.setItem(`post_comments_count_${post._id}`, commentsCount.toString());
      }
      
      // Show user-friendly error message
      const errorMessage = error?.response?.data?.message || 'Failed to add comment. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmittingComment(false);
    }
  };


  return (
    <div 
      className={`bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 relative ${
        pathname.includes('/post/') ? 'cursor-default' : 'cursor-pointer'
      }`}
      onClick={handlePostClick}
      data-post-id={post._id}
    >
      {/* Media + Info Side-by-Side */}
      <div className="flex flex-row gap-4 p-3">
        {/* Media */}
        <div 
          className="post-media relative w-[21rem] h-[24rem] overflow-hidden rounded-2xl group"
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
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => e.currentTarget.pause()}
            >
              <source src={post.media[currentMediaIndex]?.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <Image
              src={post.media[currentMediaIndex]?.url || post.media[0]?.url}
              alt="Post content"
              fill
              className="rounded-xl object-cover"
              unoptimized
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

        {/* Profile + Info */}
        <div className="flex flex-col justify-start flex-1 space-y-1 relative pb-16">
          <div className="flex items-start gap-3">
            <Link href={`/userprofile/${post.username}`}>
              <Image
                width={40}
                height={40}
                src={
                  profileImageError || !post.profileImageUrl
                    ? '/placeholderimg.png'
                    : post.profileImageUrl
                }
                alt={post.username || 'User Profile Image'}
                className="w-10 h-10 rounded-full object-cover"
                onError={() => setProfileImageError(true)}
              />
            </Link>
            <div>
                <div className='flex gap-2'>
              <h3 className="font-semibold text-gray-900">
                {post.username || 'No Username'}
              </h3>
              {post.contentType && <Badge className='bg-button-gradient' variant='outline'>{post.contentType}</Badge>}
                </div>
            {post.location && (
            <div className="flex items-center gap-1 text-gray-700">
              <MapPin className="w-3 h-3 text-yellow-500" />
              <p className="text-xs">{post.location.name}</p>
            </div>
              )}
            </div>
          </div>

          <p className="text-gray-900 leading-relaxed">{post.caption}</p>

          {post.contentType === 'service' && <ServiceCard post={post} />}
          {post.contentType === 'product' && <ProductCard post={post} />}
          {post.contentType === 'business' && <BusinessPostCard post={post} />}

        {/* Hashtags (Empty for now) */}
      <div className="px-1 pb-4">
        <div className="flex flex-wrap gap-2"><p className='text-black'>{post?.tags || "test tags, tag, nike"}</p></div>
      </div>

          {/* Comment Box - Only show for normal/regular posts and not on single post pages */}
          {(!post.contentType || post.contentType === 'normal' || post.contentType === 'regular') && !pathname.includes('/post/') && (
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
          )}

          <div className="px-2 py-1 absolute bottom-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={handleLikeToggle}
                  disabled={isLoading}
                  className={`flex items-center space-x-2 transition-colors ${
                    isLiked 
                      ? 'text-red-500' 
                      : 'text-gray-600 hover:text-red-500'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{likesCount}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`/post/${post._id}?focus=comment`, '_blank');
                  }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{commentsCount || 0}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // You can implement share functionality here
                  }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.engagement.shares || 0}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          <p className="text-xs text-gray-700 p-2">{formatPostDate(post.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}