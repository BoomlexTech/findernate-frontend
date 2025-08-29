"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PostCard from "@/components/PostCard";
import { getHomeFeed } from "@/api/homeFeed";
import { FeedPost, MediaItem } from "@/types";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";

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

export default function MainContent() {
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { isUserBlocked } = useBlockedUsers();

  const fetchPosts = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      const res = await getHomeFeed({ page: pageNum, limit: 10 });
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

      // Update hasMore based on incoming page size and whether anything was added
      setHasMore(incoming.length >= 10 && addedCount > 0);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
      if (initialLoad) setInitialLoad(false);
    }
  }, [initialLoad]);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
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

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  return (
    <div className="max-w-3xl mx-auto py-4 px-0 sm:px-4">
      {initialLoad ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FCD45C] border-t-transparent mb-4"></div>
          {/* <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading Posts...
          </h2> */}
        </div>
      ) : feed.length === 0 ? (
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
            .map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          <div ref={loaderRef} className="h-10">
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FCD45C]"></div>
              </div>
            )}
          </div>

          {!hasMore && !loading && (
            <div className="text-center py-8 text-gray-500">
              You&apos;ve reached the end of the feed
            </div>
          )}
        </>
      )}
    </div>
  );
}