"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
// import { Button } from "@/components/ui/button";
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
      // optional: mood, activity, etc.
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
};



export default function MainContent() {
  // const [posts, setPosts] = useState('');
  // const [loading, setLoading] = useState(false);
  const [feed, setFeed] = useState<FeedPost[]>([]);

  useEffect(()=> {
    const fetchPosts = async () => {
      try{
      const res = await getHomeFeed()
        const mappedFeed: FeedPost[] = res.data.feed.map((item: RawFeedItem ) => ({
        _id: item._id,
        username: item.userId.username,
        profileImageUrl: item.userId.profileImageUrl,
        description: item.description,
        caption: item.caption,
        contentType: item.contentType,
        postType: item.postType,
        createdAt: item.createdAt,
        media: item.media as MediaItem[],
          engagement: item.engagement || {
            comments: 0,
            impressions: 0,
            likes: 0,
            reach: 0,
            saves: 0,
            shares: 0,
            views: 0,},
      location: item.customization?.normal?.location || null,
      tags: item.customization?.normal?.tags || [],
      }))
      setFeed(mappedFeed);
      console.log(res);
    } catch(err) {
      console.log(err);
    }
  }

    fetchPosts();
  },[]);


  // const loadMorePosts = () => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     setPosts([
  //       ...posts,
  //       ...mockPosts.map((post) => ({
  //         ...post,
  //         id: post.id + posts.length,
  //       })),
  //     ]);
  //     setLoading(false);
  //   }, 1000);
  // };

  return (
    <div className="max-w-3xl mx-auto py-4 px-4">
      {feed.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📱</div>
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
            {feed.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* {posts.length >= 15 && (
            <div className="mt-8 text-center">
              <Button
                onClick={loadMorePosts}
                disabled={loading}
                className="px-8 py-3 bg-white text-gray-900 border-2 border-[#FCD45C] hover:bg-[#FCD45C] hover:text-black transition-all duration-200 font-medium"
              >
                {loading ? "Loading..." : "Load More Posts"}
              </Button>
            </div>
          )} */}
        </>
      )}
    </div>
  );
}