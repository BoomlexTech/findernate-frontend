"use client";

import { useState } from "react";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";

const mockPosts = [
  {
    id: 1,
    user: {
      profilePic:
        "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150",
      fullName: "Sarah Johnson",
      username: "@sarahj_design",
      isBusinessAccount: true,
      businessCategory: "Design Studio",
    },
    timePosted: "2 hours ago",
    description:
      "Just launched our new brand identity service! We help businesses create memorable brands that stand out in the market.",
    productWindow: {
      heading: "Brand Identity Package",
      text: "Complete brand design including logo, color palette, typography, and brand guidelines.",
      price: "₹2,499",
    },
    image: "https://picsum.photos/400",
    location: "New York, NY",
    hashtags: ["#branding", "#design", "#business", "#startup"],
    likes: 248,
    comments: 32,
    shares: 15,
  },
  {
    id: 2,
    user: {
      profilePic:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
      fullName: "Michael Chen",
      username: "@mikec_dev",
      isBusinessAccount: false,
    },
    timePosted: "4 hours ago",
    description:
      "Beautiful sunset from my morning hike. Nature always reminds me to slow down and appreciate the simple things.",
    image: "https://picsum.photos/400",
    location: "Malibu, CA",
    hashtags: ["#nature", "#sunset", "#hiking", "#mindfulness"],
    likes: 156,
    comments: 24,
    shares: 8,
  },
  {
    id: 3,
    user: {
      profilePic:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150",
      fullName: "Emma Rodriguez",
      username: "@emma_nutrition",
      isBusinessAccount: true,
      businessCategory: "Nutrition Coach",
    },
    timePosted: "6 hours ago",
    description:
      "Transform your health with our personalized nutrition coaching program. Get the results you deserve with science-based approach.",
    productWindow: {
      heading: "3-Month Nutrition Program",
      text: "Personalized meal plans, weekly check-ins, and ongoing support to help you reach your health goals.",
      price: "₹299",
    },
    image: "https://picsum.photos/400",
    location: "Los Angeles, CA",
    hashtags: ["#nutrition", "#health", "#wellness", "#fitness"],
    likes: 189,
    comments: 41,
    shares: 22,
  },
];

export default function MainContent() {
  const [posts, setPosts] = useState(mockPosts);
  const [loading, setLoading] = useState(false);

  const loadMorePosts = () => {
    setLoading(true);
    setTimeout(() => {
      setPosts([
        ...posts,
        ...mockPosts.map((post) => ({
          ...post,
          id: post.id + posts.length,
        })),
      ]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-xl mx-auto py-4 px-4">
      {posts.length === 0 ? (
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
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {posts.length >= 15 && (
            <div className="mt-8 text-center">
              <Button
                onClick={loadMorePosts}
                disabled={loading}
                className="px-8 py-3 bg-white text-gray-900 border-2 border-[#FCD45C] hover:bg-[#FCD45C] hover:text-black transition-all duration-200 font-medium"
              >
                {loading ? "Loading..." : "Load More Posts"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}