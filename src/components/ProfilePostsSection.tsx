'use client';
import React, { useState } from 'react';
import { Grid3X3, Play, Video, Heart, MessageCircle } from 'lucide-react';
import { FeedPost } from '@/types';
import Image from 'next/image';
import { likePost, unlikePost } from '@/api/post';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { AxiosError } from 'axios';

interface ProfilePostsSectionProps {
  PostCard: React.ComponentType<{post: FeedPost}>
  posts?: FeedPost[];
  username?: string;
  reels?: FeedPost[];
  videos?: FeedPost[];
  isOtherUser?: boolean;
  loading?: boolean;
  onTabChange?: (tab: string) => void;
}

const ProfilePostsSection: React.FC<ProfilePostsSectionProps> = ({
  PostCard,
  posts = [],
  reels = [],
  videos = [],
  isOtherUser = false,
  loading = false,
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState('posts');
  const { requireAuth } = useAuthGuard();
  const [postLikes, setPostLikes] = useState<{[key: string]: {isLiked: boolean, count: number}}>({});
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);

  // Show same tabs for both current user and other user profiles
  const tabs = [
    { id: 'posts', label: 'Posts', icon: Grid3X3, count: posts.length },
    { id: 'reels', label: 'Reels', icon: Play, count: reels.length },
    { id: 'videos', label: 'Videos', icon: Video, count: videos.length }
  ];

  const getCurrentPosts = () => {
    switch (activeTab) {
      case 'reels':
        return reels;
      case 'videos':
        return videos;
      default:
        return posts;
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const getLikeState = (post: FeedPost) => {
    return postLikes[post._id] || {
      isLiked: post.isLikedBy,
      count: post.engagement.likes
    };
  };

  const handleLikeToggle = async (post: FeedPost, e: React.MouseEvent) => {
    e.stopPropagation();
    requireAuth(async () => {
      const currentState = getLikeState(post);
      const shouldLike = !currentState.isLiked;
      const newCount = shouldLike ? currentState.count + 1 : currentState.count - 1;
      
      // Optimistic update
      setPostLikes(prev => ({
        ...prev,
        [post._id]: {
          isLiked: shouldLike,
          count: newCount
        }
      }));

      try {
        if (shouldLike) {
          await likePost(post._id);
        } else {
          await unlikePost(post._id);
        }
      } catch (error) {
        // Revert on error
        setPostLikes(prev => ({
          ...prev,
          [post._id]: currentState
        }));
      }
    });
  };

  const handleCommentClick = (post: FeedPost, e: React.MouseEvent) => {
    e.stopPropagation();
    requireAuth(() => {
      window.open(`/post/${post._id}?focus=comments`, '_blank');
    });
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm px-4 py-6">
      {/* Tabs Header */}
      <div className="flex justify-center border-b border-gray-200 mb-6">
        <div className="flex gap-6 sm:gap-12 text-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 py-2 px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`ml-1 text-xs ${
                      activeTab === tab.id ? 'text-orange-600' : 'text-gray-400'
                    }`}
                  >
                    ({tab.count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-screen-lg mx-auto w-full">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading {activeTab}...</p>
          </div>
        ) : getCurrentPosts().length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {activeTab === 'posts' && <Grid3X3 className="w-12 h-12 mx-auto" />}
              {activeTab === 'reels' && <Play className="w-12 h-12 mx-auto" />}
              {activeTab === 'videos' && <Video className="w-12 h-12 mx-auto" />}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} yet
            </h3>
            <p className="text-gray-500">
              {activeTab === 'posts' && (isOtherUser ? "No posts shared yet" : "Share your first post to get started")}
              {activeTab === 'reels' && (isOtherUser ? "No reels shared yet" : "Create your first reel")}
              {activeTab === 'videos' && (isOtherUser ? "No videos shared yet" : "Upload your first video")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getCurrentPosts().map((post, index) => {
              const likeState = getLikeState(post);
              return (
                <div
                  key={post._id || index}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Media Section */}
                  <div 
                    className={`${activeTab === 'reels' ? 'aspect-auto' : 'aspect-square'} bg-gray-100 overflow-hidden cursor-pointer hover:opacity-95 transition-opacity relative group`}
                    onClick={() => {
                      window.open(`/post/${post._id}`, '_blank');
                    }}
                    onMouseEnter={() => activeTab === 'reels' && setHoveredVideo(post._id)}
                    onMouseLeave={() => activeTab === 'reels' && setHoveredVideo(null)}
                  >
                    {(() => {
                      const currentMedia = post.media[0];
                      const rawUrl = typeof currentMedia?.url === 'string' ? currentMedia.url.trim() : '';
                      const safeUrl = rawUrl.length > 0 ? rawUrl : undefined;
                      const rawThumb = typeof currentMedia?.thumbnailUrl === 'string' ? currentMedia.thumbnailUrl.trim() : '';
                      const safeThumb = rawThumb.length > 0 ? rawThumb : '/placeholderimg.png';
                      const isVideo = currentMedia?.type === 'video' && !!safeUrl;

                      if (isVideo) {
                        const isReelTab = activeTab === 'reels';
                        const isHovered = hoveredVideo === post._id;
                        const shouldShowVideo = isReelTab && isHovered;
                        
                        if (isReelTab) {
                          return (
                            <div className="relative w-full" style={{ paddingBottom: '177.78%' }}>
                              {/* Video - always present, plays/pauses based on hover */}
                              <video
                                className="absolute inset-0 w-full h-full object-contain"
                                muted
                                loop
                                playsInline
                                preload="auto"
                                ref={(video) => {
                                  if (video) {
                                    if (shouldShowVideo) {
                                      video.play();
                                    } else {
                                      video.pause();
                                    }
                                  }
                                }}
                              >
                                {safeUrl && <source src={safeUrl} type="video/mp4" />}
                              </video>
                              
                              {/* Play icon overlay - only when paused */}
                              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${shouldShowVideo ? 'opacity-0' : 'opacity-100'}`}>
                                <div className="bg-black/50 rounded-full p-3">
                                  <Play className="w-6 h-6 text-white fill-white" />
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          // Non-reel videos
                          return (
                            <>
                              <video
                                className="w-full h-full object-cover"
                                poster={safeThumb}
                                muted
                                preload="none"
                              >
                                {safeUrl && <source src={safeUrl} type="video/mp4" />}
                              </video>
                              {/* Video indicator */}
                              <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                                <Play className="w-3 h-3 text-white fill-white" />
                              </div>
                            </>
                          );
                        }
                      }

                      // Image fallback
                      const imageUrl = safeUrl || safeThumb || '/placeholderimg.png';
                      return (
                        <Image
                          src={imageUrl}
                          alt="Post content"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      );
                    })()}
                    
                    {/* Multiple media indicator */}
                    {post.media.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                        <Grid3X3 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Engagement Section */}
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Like Button */}
                        <button 
                          onClick={(e) => handleLikeToggle(post, e)}
                          className={`flex items-center space-x-1 p-1 rounded-lg transition-colors ${
                            likeState.isLiked 
                              ? 'text-red-500' 
                              : 'text-gray-600 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${likeState.isLiked ? 'fill-current' : ''}`} />
                          <span className="text-sm font-medium">{likeState.count}</span>
                        </button>

                        {/* Comment Button */}
                        <button 
                          onClick={(e) => handleCommentClick(post, e)}
                          className="flex items-center space-x-1 p-1 rounded-lg text-gray-600 hover:text-blue-500 transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">{post.engagement.comments || 0}</span>
                        </button>
                      </div>

                      {/* Caption Preview */}
                      {post.caption && (
                        <div className="flex-1 ml-4">
                          <p className="text-sm text-gray-800 line-clamp-1">
                            {post.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePostsSection;