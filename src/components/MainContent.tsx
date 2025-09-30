"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PostCard from "@/components/PostCard";
import { getHomeFeed } from "@/api/homeFeed";
import { FeedPost, MediaItem } from "@/types";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { usePostRefresh } from "@/hooks/usePostRefresh";
import MainContentSkeleton from "@/components/skeletons/MainContentSkeleton";

interface MainContentProps {
  showIndividualSkeleton?: boolean;
}

type RawFeedItem = {
  _id: string;
  userId: {
    _id?: string;
    username?: string;
    profileImageUrl?: string;
  } | null;
  description: string;
  caption: string;
  contentType: 'normal' | 'business' | 'service' | 'product'; 
  postType: string;
  createdAt: string;
  media: MediaItem[];
  isLikedBy: boolean;
  likedBy: string[];
  engagement?: {
    comments: number;
    impressions: number;
    likes: number;
    reach: number;
    saves: number;
    shares: number;
    views: number;
  }
  customization?: {
    normal?: {
      location?: {
        name: string;
        coordinates: {
          type: string;
          coordinates: [number, number];
        };
      };
      tags?: string[];
    };
    business?: {
      description: string;
      location?: {
        name: string;
        coordinates: {
          type: string;
          coordinates: [number, number];
        };
      };
      tags?: string[];
    };
    service?: {
      name?: string;
      description?: string;
      price?: number;
      currency?: string;
      category?: string;
      subcategory?: string;
      duration?: number;
      serviceType?: string;
      location?: {
        name: string;
        coordinates?: {
          type: string;
          coordinates: [number, number];
        };
      };
      requirements?: string[];
      deliverables?: string[];
      tags?: string[];
      link?: string;
      availability?: {
        schedule: Array<{
          day: string;
          timeSlots: Array<{ startTime: string; endTime: string }>;
        }>;
        timezone: string;
        bookingAdvance: number;
        maxBookingsPerDay: number;
      };
    };
    product?: {
      name?: string;
      price?: number;
      currency?: string;
      inStock?: boolean;
      link?: string;
      location?: {
        name: string;
        coordinates?: {
          type: string;
          coordinates: [number, number];
        };
      };
    };
  };
};

type RawComment = { replies?: unknown[] };

export default function MainContent({ showIndividualSkeleton = true }: MainContentProps) {
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isUserBlocked } = useBlockedUsers();

  const fetchPosts = useCallback(async (pageNum: number) => {
    try {
      if (pageNum > 1) {
        setIsLoadingMore(true);
        
        // Set timeout to show "end of feed" if loading takes too long
        loadingTimeoutRef.current = setTimeout(() => {
          setIsLoadingMore(false);
          setLoading(false);
          setHasMore(false);
        }, 1500);
      } else {
        setLoading(true);
      }
      
      const res = await getHomeFeed({ page: pageNum, limit: 10 });
      
      // Clear the timeout since we got a response
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      // Logs removed per request
      const incoming: FeedPost[] = res.data.feed
        // Filter out posts from blocked users
        .filter((item: RawFeedItem) => {
          if (!item.userId?._id) return true; // Keep posts with no user info (shouldn't happen)
          return !isUserBlocked(item.userId._id);
        })
        .map((item: RawFeedItem & { comments?: RawComment[] }) => {
        // Calculate actual comment count from comments array
        let actualCommentCount = 0;
        if (item.comments && Array.isArray(item.comments)) {
          // Count top-level comments + replies
          actualCommentCount = item.comments.reduce((total, comment: RawComment) => {
            const repliesCount = Array.isArray(comment.replies) ? comment.replies.length : 0;
            return total + 1 + repliesCount; // 1 for the comment itself + replies
          }, 0);
        }
        
        
        const safeUsername = item.userId?.username || 'Deleted User';
        const safeProfileImageUrl = item.userId?.profileImageUrl || '/placeholderimg.png';

        return {
          _id: item._id,
          username: safeUsername,
          profileImageUrl: safeProfileImageUrl,
          description: item.description,
          caption: item.caption,
          contentType: item.contentType,
          postType: item.postType,
          createdAt: item.createdAt,
          media: item.media as MediaItem[],
          isLikedBy: item.isLikedBy,
          likedBy: item.likedBy,
          customization: item.customization,
          engagement: {
            ...(item.engagement || {}),
            comments: actualCommentCount, // Use calculated count
            impressions: item.engagement?.impressions || 0,
            likes: item.engagement?.likes || 0,
            reach: item.engagement?.reach || 0,
            saves: item.engagement?.saves || 0,
            shares: item.engagement?.shares || 0,
            views: item.engagement?.views || 0,
          },
          location:
            item.customization?.normal?.location ||
            item.customization?.service?.location ||
            item.customization?.product?.location ||
            item.customization?.business?.location ||
            null,
          tags: item.customization?.normal?.tags || [],
        };
      });

      // Check for pagination info from the API response
      const pagination = res.data.pagination;
      const totalPages = pagination?.totalPages || 0;
      const currentPage = pagination?.currentPage || pageNum;
      
      // Deduplicate and append using functional update to avoid stale deps
      let addedCount = 0;
      
      setFeed(prev => {
        if (pageNum === 1) {
          // Replace on first page
          addedCount = incoming.length;
          return incoming;
        }
        const existingIds = new Set(prev.map(p => p._id));
        const deduped = incoming.filter(p => !existingIds.has(p._id));
        addedCount = deduped.length;
        return [...prev, ...deduped];
      });

      // Update hasMore based on pagination info or fallback to original logic
      if (pagination && totalPages > 0) {
        // Use pagination info if available
        setHasMore(currentPage < totalPages);
      } else {
        // Fallback: consider we have more if we got a full page and added new items
        setHasMore(incoming.length >= 10 && addedCount > 0);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      // Clear timeout on error and show end of feed
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
      if (initialLoad) setInitialLoad(false);
    }
  }, [initialLoad, isUserBlocked]);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !loading && !isLoadingMore) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, loading, isLoadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "300px", // Increased for even earlier loading
      threshold: 0.1
    });

    const current = loaderRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [handleObserver]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  // Listen for new post creation events and refresh the feed
  const refreshFeed = useCallback(() => {
    // Refresh the feed by fetching the first page again
    // This will show the new post at the top
    setPage(1);
    setHasMore(true);
  }, []);

  usePostRefresh(refreshFeed);

  // While the initial fetch is in progress we should not show the
  // "No Posts Available" fallback. If this component is responsible for
  // its own skeletons, render it. Otherwise return null so a page-level
  // skeleton (e.g. HomeFeedSkeleton) can control the loading UI.
  if (initialLoad) {
    return showIndividualSkeleton ? <MainContentSkeleton /> : null;
  }

  return (
  <div className="max-w-3xl mx-auto py-4 px-0 sm:px-4">
      {feed.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Posts Available
          </h2>
          <p className="text-gray-600">
            Be the first to share something amazing!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-0 sm:space-y-6 mt-0 sm:mt-6">
            {feed
            .filter(post => !!post && !!post._id)
            .map((post, index) => (
              <div key={`${post._id}-${index}`} className="will-change-transform">
                <PostCard post={post} />
              </div>
            ))}
          </div>

          <div ref={loaderRef} className="h-10">
            {(loading || isLoadingMore) && hasMore && (
              <div className="text-center py-2">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#FCD45C] opacity-60"></div>
              </div>
            )}
          </div>

          {!hasMore && feed.length > 0 && (
            <div className="text-center py-6 text-gray-400 text-sm">
              You&apos;ve reached the end of the feed
            </div>
          )}
        </>
      )}
    </div>
  );
}