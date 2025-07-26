"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PostCard from "@/components/PostCard";
import { getHomeFeed } from "@/api/homeFeed";
import { FeedPost, MediaItem } from "@/types";

type RawFeedItem = {
  _id: string;
  userId: {
    username: string;
    profileImageUrl: string;
  };
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
      description: string;
      category?: string;
      currency?: string;
      deliverables?: string[];
      availability?: {
        schedule: [];
        timezone: string;
        bookingAdvance: number;
        maxBookingsPerDay: number;
      };
    };
  };
};

export default function MainContent() {
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchPosts = async (pageNum: number) => {
    try {
      setLoading(true);
      const res = await getHomeFeed({ page: pageNum, limit: 10 });
      
      const mappedFeed: FeedPost[] = res.data.feed.map((item: RawFeedItem) => ({
        _id: item._id,
        username: item.userId.username,
        profileImageUrl: item.userId.profileImageUrl,
        description: item.description,
        caption: item.caption,
        contentType: item.contentType,
        postType: item.postType,
        createdAt: item.createdAt,
        media: item.media as MediaItem[],
        isLikedBy: item.isLikedBy,
        likedBy: item.likedBy,
        engagement: item.engagement || {
          comments: 0,
          impressions: 0,
          likes: 0,
          reach: 0,
          saves: 0,
          shares: 0,
          views: 0,
        },
        location: item.customization?.normal?.location || null,
        tags: item.customization?.normal?.tags || [],
      }));

      const newPosts = mappedFeed.filter(
        newPost => !feed.some(existingPost => existingPost._id === newPost._id)
      );

      if (pageNum === 1) {
        setFeed(mappedFeed);
      } else {
        setFeed(prev => [...prev, ...newPosts]);
      }

      if (mappedFeed.length < 10 || newPosts.length === 0) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
      if (initialLoad) setInitialLoad(false);
    }
  };

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

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [handleObserver]);

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  return (
    <div className="max-w-3xl mx-auto py-4 px-4">
      {initialLoad ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading Posts...
          </h2>
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
          <div className="space-y-6 mt-6">
            {feed
            .filter(post => post.username !== null)
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