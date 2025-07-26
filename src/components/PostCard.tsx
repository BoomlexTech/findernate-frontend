'use client';

import { Heart, MessageCircle, Share2, MapPin } from 'lucide-react'; //Phone
import Image from 'next/image';
import Link from 'next/link';
import { FeedPost } from '@/types';
// import { Button } from './ui/button';
import formatPostDate from '@/utils/formatDate';
import { useState, useEffect } from 'react';
import ServiceCard from './post-window/ServiceCard';
import { Badge } from './ui/badge';
import ProductCard from './post-window/ProductCard';
import BusinessPostCard from './post-window/BusinessCard';
import { likePost, unlikePost } from '@/api/post';
import { postEvents } from '@/utils/postEvents';
import { getCommentsByPost, Comment } from '@/api/comment';

export interface PostCardProps {
  post: FeedPost;
}

export default function PostCard({ post }: PostCardProps) {
  const [profileImageError, setProfileImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLikedBy);
  const [likesCount, setLikesCount] = useState(post.engagement.likes);
  const [commentsCount, setCommentsCount] = useState(post.engagement.comments);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRefreshed, setHasRefreshed] = useState(false);

  // Sync local state with prop changes (important for page refreshes)
  useEffect(() => {
    setIsLiked(post.isLikedBy);
    setLikesCount(post.engagement.likes);
    setCommentsCount(post.engagement.comments);
  }, [post.isLikedBy, post.engagement.likes, post.engagement.comments]);

  // Fetch fresh comment count on component mount
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        console.log(`Fetching comment count for post ${post._id}...`);
        const commentsResponse: Comment[] | any = await getCommentsByPost(post._id);
        console.log(`Comments response for post ${post._id}:`, commentsResponse);
        
        let actualCount = 0;
        
        // Handle different possible response formats
        if (Array.isArray(commentsResponse)) {
          actualCount = commentsResponse.length;
        } else if (commentsResponse && typeof commentsResponse === 'object') {
          if (Array.isArray(commentsResponse.comments)) {
            actualCount = commentsResponse.comments.length;
          } else if (typeof commentsResponse.count === 'number') {
            actualCount = commentsResponse.count;
          }
        }
        
        console.log(`Actual comment count for post ${post._id}: ${actualCount}, Current count: ${commentsCount}`);
        
        // Always update to ensure we have the correct count
        setCommentsCount(actualCount);
      } catch (error) {
        console.error('Error fetching comment count for post:', post._id, error);
        // Don't change the count on error, keep the original value
      }
    };

    fetchCommentCount();
  }, [post._id]); // Only run when post ID changes

  // For debugging - log the initial like state
  useEffect(() => {
    console.log(`PostCard loaded for post ${post._id}: isLikedBy=${post.isLikedBy}, likes=${post.engagement.likes}`);
  }, [post._id]);

  // Load like status from localStorage on component mount (for persistence across refreshes)
  useEffect(() => {
    if (!hasRefreshed && typeof window !== 'undefined') {
      const savedLikeStatus = localStorage.getItem(`post_like_${post._id}`);
      const savedLikesCount = localStorage.getItem(`post_likes_count_${post._id}`);
      
      if (savedLikeStatus !== null) {
        const isLikedFromStorage = savedLikeStatus === 'true';
        const likesCountFromStorage = savedLikesCount ? parseInt(savedLikesCount) : post.engagement.likes;
        
        console.log(`Loading like status from localStorage for post ${post._id}: isLiked=${isLikedFromStorage}, count=${likesCountFromStorage}`);
        setIsLiked(isLikedFromStorage);
        setLikesCount(likesCountFromStorage);
      }
      setHasRefreshed(true);
    }
  }, [post._id, post.engagement.likes, hasRefreshed]);

  // Listen for comment count changes from other tabs/components
  useEffect(() => {
    const cleanup = postEvents.on(post._id, 'commentCountChange', (newCount: number) => {
      console.log(`Comment count updated for post ${post._id}: ${newCount}`);
      setCommentsCount(newCount);
    });

    return cleanup;
  }, [post._id]);

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
    localStorage.setItem(`post_like_${post._id}`, shouldLike.toString());
    localStorage.setItem(`post_likes_count_${post._id}`, newLikesCount.toString());
    
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
      localStorage.setItem(`post_like_${post._id}`, previousIsLiked.toString());
      localStorage.setItem(`post_likes_count_${post._id}`, previousLikesCount.toString());
    } finally {
      console.log(`=== LIKE TOGGLE END - Expected final state: isLiked: ${shouldLike}, loading: false ===`);
      setIsLoading(false);
    }
  };

  const handlePostClick = (e: React.MouseEvent) => {
    // Check if we're already on a post page (single post view)
    if (window.location.pathname.includes('/post/')) {
      return; // Don't open new tab if already on post page
    }
    
    // Prevent opening if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) {
      return;
    }
    // Open post page in new tab with post data in URL state
    const postData = encodeURIComponent(JSON.stringify(post));
    window.open(`/post/${post._id}?data=${postData}`, '_blank');
  };

  return (
    <div 
      className={`bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 relative ${
        window.location.pathname.includes('/post/') ? 'cursor-default' : 'cursor-pointer'
      }`}
      onClick={handlePostClick}
    >
      {/* Media + Info Side-by-Side */}
      <div className="flex flex-row gap-4 p-3">
        {/* Media */}
        {post.media[0]?.type === 'video' ? (
          <div className="w-[21rem] h-[21rem] overflow-hidden rounded-xl">
            <video
              controls
              className="w-full h-full object-cover rounded-xl"
              poster={post.media[0]?.thumbnailUrl}
            >
              <source src={post.media[0]?.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div className="relative w-[21rem] h-[24rem] overflow-hidden rounded-2xl">
            <Image
              src={post.media[0]?.url}
              alt="Post content"
              layout="fill"
              objectFit="cover"
              className="rounded-xl"
              unoptimized
            />
          </div>
        )}

        {/* Profile + Info */}
        <div className="flex flex-col justify-start flex-1 space-y-3 relative">
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
              <h3 className="font-semibold text-gray-900">{post.username}</h3>
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

          {post.contentType === 'service' && <ServiceCard />}
          {post.contentType === 'product' && <ProductCard />}
          {post.contentType === 'business' && <BusinessPostCard />}

          

        {/* Hashtags (Empty for now) */}
      <div className="px-1 pb-4">
        <div className="flex flex-wrap gap-2"><p className='text-black'>{post?.tags || "test tags, tag, nike"}</p></div>
      </div>

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
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{commentsCount || 0}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">{post.engagement.shares || 0}</span>
            </button>
          </div>
        </div>
      </div>

        </div>



      <div className="absolute bottom-2 right-2 text-xs text-gray-500">
      <p className="text-xs text-gray-700 p-2">{formatPostDate(post.createdAt)}</p>
      </div>

    </div>
    </div>
  );
}