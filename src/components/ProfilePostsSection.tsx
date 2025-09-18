'use client';
import React, { useState, useEffect } from 'react';
import { Grid3X3, Play, Video, Heart, MessageCircle, Bookmark, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { FeedPost } from '@/types';
import Image from 'next/image';
import { likePost, unlikePost, toggleSavedPostPrivacy, togglePostPrivacy } from '@/api/post';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

interface ProfilePostsSectionProps {
  PostCard: React.ComponentType<{post: FeedPost}>
  posts?: FeedPost[];
  username?: string;
  reels?: FeedPost[];
  videos?: FeedPost[];
  savedPosts?: FeedPost[];
  isOtherUser?: boolean;
  loading?: boolean;
  onTabChange?: (tab: string) => void;
}

const ProfilePostsSection: React.FC<ProfilePostsSectionProps> = ({
  PostCard,
  posts = [],
  reels = [],
  videos = [],
  savedPosts = [],
  isOtherUser = false,
  loading = false,
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState('posts');
  const { requireAuth } = useAuthGuard();
  const [postLikes, setPostLikes] = useState<{[key: string]: {isLiked: boolean, count: number}}>({});
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: string]: number}>({});
  const [privacyToggles, setPrivacyToggles] = useState<{[key: string]: 'private' | 'public'}>({});
  const [postPrivacyToggles, setPostPrivacyToggles] = useState<{[key: string]: 'private' | 'public'}>({});
  const [isTogglingPostPrivacy, setIsTogglingPostPrivacy] = useState<{[key: string]: boolean}>({});

  // Handle video playback based on hover state
  useEffect(() => {
    if (activeTab === 'saved') {
      const currentPosts = getCurrentPosts();
      currentPosts?.forEach(post => {
        const currentMediaIndex = getCurrentImageIndex(post._id);
        const currentMedia = post.media[currentMediaIndex];
        
        if (currentMedia?.type === 'video') {
          const videos = document.querySelectorAll(`video[data-post-id="${post._id}"][data-media-index="${currentMediaIndex}"]`);
          videos.forEach((video: any) => {
            if (hoveredVideo === post._id) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        }
      });
    }
  }, [hoveredVideo, activeTab, currentImageIndex]);

  // Show tabs for all users - saved tab shows public saved posts for other users
  const tabs = [
    { id: 'posts', label: 'Posts', icon: Grid3X3, count: posts.length },
    { id: 'reels', label: 'Reels', icon: Play, count: reels.length },
    { id: 'videos', label: 'Videos', icon: Video, count: videos.length },
    { id: 'saved', label: 'Saved', icon: Bookmark, count: savedPosts.length }
  ];

  const formatCount = (count: number) => {
    return count > 99 ? '99+' : count.toString();
  };

  const getCurrentPosts = () => {
    switch (activeTab) {
      case 'reels':
        return reels;
      case 'videos':
        return videos;
      case 'saved':
        return savedPosts;
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

  const getCurrentImageIndex = (postId: string) => {
    return currentImageIndex[postId] || 0;
  };

  const handlePreviousImage = (post: FeedPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = getCurrentImageIndex(post._id);
    const newIndex = currentIndex > 0 ? currentIndex - 1 : post.media.length - 1;
    setCurrentImageIndex(prev => ({
      ...prev,
      [post._id]: newIndex
    }));
  };

  const handleNextImage = (post: FeedPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = getCurrentImageIndex(post._id);
    const newIndex = currentIndex < post.media.length - 1 ? currentIndex + 1 : 0;
    setCurrentImageIndex(prev => ({
      ...prev,
      [post._id]: newIndex
    }));
  };

  const handlePrivacyToggle = async (post: FeedPost, e: React.MouseEvent) => {
    e.stopPropagation();
    requireAuth(async () => {
      const currentPrivacy = (post as any).savedPostPrivacy || 'private';
      const newPrivacy = currentPrivacy === 'private' ? 'public' : 'private';
      
      // Optimistic update
      setPrivacyToggles(prev => ({
        ...prev,
        [post._id]: newPrivacy
      }));

      try {
        await toggleSavedPostPrivacy(post._id, newPrivacy);
        // Update the post's privacy in the saved posts array
        (post as any).savedPostPrivacy = newPrivacy;
      } catch (error) {
        console.error('Error toggling saved post privacy:', error);
        // Revert on error
        setPrivacyToggles(prev => ({
          ...prev,
          [post._id]: currentPrivacy
        }));
      }
    });
  };

  const getPostPrivacy = (post: FeedPost): 'private' | 'public' => {
    return privacyToggles[post._id] || (post as any).savedPostPrivacy || 'private';
  };

  const handlePostPrivacyToggle = async (post: FeedPost, e: React.MouseEvent) => {
    e.stopPropagation();
    requireAuth(async () => {
      const postId = post._id;
      if (isTogglingPostPrivacy[postId]) return;

      setIsTogglingPostPrivacy(prev => ({ ...prev, [postId]: true }));
      const currentPrivacy = postPrivacyToggles[postId] || (post as any).privacy || 'public';
      const newPrivacy = currentPrivacy === 'private' ? 'public' : 'private';

      // Optimistic update
      setPostPrivacyToggles(prev => ({ ...prev, [postId]: newPrivacy }));

      try {
        await togglePostPrivacy(postId, newPrivacy);
        // Update the post object as well
        (post as any).privacy = newPrivacy;
        toast.success(`Post is now ${newPrivacy}!`, { autoClose: 2000 });
      } catch (error) {
        console.error('Error toggling post privacy:', error);
        // Revert on error
        setPostPrivacyToggles(prev => ({ ...prev, [postId]: currentPrivacy }));
        toast.error('Failed to update post privacy. Please try again.');
      } finally {
        setIsTogglingPostPrivacy(prev => ({ ...prev, [postId]: false }));
      }
    });
  };

  const getRegularPostPrivacy = (post: FeedPost): 'private' | 'public' => {
    return postPrivacyToggles[post._id] || (post as any).privacy || 'public';
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm px-4 py-6">
      {/* Tabs Header */}
      <div className="flex justify-center border-b border-gray-200 mb-6">
        <div className="flex gap-4 sm:gap-100 md:gap-12 text-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-orange-600 border-b-2 border-orange-600'  
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-0">
                  <Icon className="w-5 h-5 sm:w-4 sm:h-4" />
                  {tab.count > 0 && (
                    <span
                      className={`ml-2 text-xs font-semibold ${
                        activeTab === tab.id ? 'text-orange-600' : 'text-gray-400'
                      }`}
                    >
                      ({formatCount(tab.count)})
                    </span>
                  )}
                </div>
                {/* Show label on all screen sizes */}
                <span className="text-xs sm:text-sm">
                  {tab.label}
                </span>
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
              {activeTab === 'saved' && <Bookmark className="w-12 h-12 mx-auto" />}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} yet
            </h3>
            <p className="text-gray-500">
              {activeTab === 'posts' && (isOtherUser ? "No posts shared yet" : "Share your first post to get started")}
              {activeTab === 'reels' && (isOtherUser ? "No reels shared yet" : "Create your first reel")}
              {activeTab === 'videos' && (isOtherUser ? "No videos shared yet" : "Upload your first video")}
              {activeTab === 'saved' && (isOtherUser ? "No public saved posts yet" : "No saved posts yet")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getCurrentPosts().map((post, index) => {
              const likeState = getLikeState(post);
              
              // Debug like state for saved posts
              if (activeTab === 'saved') {
                console.log(`Saved post ${post._id} like state:`, {
                  isLikedBy: post.isLikedBy,
                  likeState: likeState,
                  engagementLikes: post.engagement.likes
                });
              }
              
              return (
                <div
                  key={post._id || index}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Media Section */}
                  <div 
                    className={`${
                      activeTab === 'reels' ? 'aspect-auto' : 
                      'aspect-square'
                    } bg-gray-100 overflow-hidden cursor-pointer hover:opacity-95 transition-opacity relative group`}
                    onClick={() => {
                      window.open(`/post/${post._id}`, '_blank');
                    }}
                    onMouseEnter={() => (activeTab === 'reels' || (activeTab === 'saved' && post.media[0]?.type === 'video')) && setHoveredVideo(post._id)}
                    onMouseLeave={() => (activeTab === 'reels' || (activeTab === 'saved' && post.media[0]?.type === 'video')) && setHoveredVideo(null)}
                  >
                    {activeTab === 'saved' && post.media.length > 1 ? (
                      // Multiple media carousel for saved posts
                      post.media.map((media, mediaIndex) => {
                        const rawUrl = typeof media?.url === 'string' ? media.url.trim() : '';
                        const safeUrl = rawUrl.length > 0 ? rawUrl : undefined;
                        const rawThumb = typeof media?.thumbnailUrl === 'string' ? media.thumbnailUrl.trim() : '';
                        const safeThumb = rawThumb.length > 0 ? rawThumb : '/placeholderimg.png';
                        const isVideo = media?.type === 'video' && !!safeUrl;
                        const isCurrentMedia = mediaIndex === getCurrentImageIndex(post._id);
                        const isHovered = hoveredVideo === post._id;
                        const shouldShowVideo = isVideo && isCurrentMedia && isHovered;

                        return (
                          <div
                            key={mediaIndex}
                            className={`absolute inset-0 transition-opacity duration-300 ${
                              isCurrentMedia ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                          >
                            {isVideo ? (
                              <>
                                <video
                                  className="w-full h-full object-cover"
                                  muted
                                  loop
                                  playsInline
                                  preload="metadata"
                                  data-post-id={post._id}
                                  data-media-index={mediaIndex}
                                  ref={(video) => {
                                    if (video && isCurrentMedia) {
                                      video.load();
                                      
                                      video.addEventListener('loadedmetadata', () => {
                                        video.currentTime = 0.1;
                                      });
                                      
                                      video.addEventListener('canplay', () => {
                                        const currentlyHovered = hoveredVideo === post._id;
                                        // For saved tab, only play on hover
                                        // For other profile tabs, always play
                                        const isProfileTab = activeTab !== 'saved';
                                        const shouldPlay = isProfileTab || currentlyHovered;
                                        
                                        if (!shouldPlay) {
                                          video.pause();
                                        } else {
                                          video.play().catch(() => {});
                                        }
                                      });
                                      
                                      // Initial state based on tab and hover
                                      const isProfileTab = activeTab !== 'saved';
                                      const currentlyHovered = hoveredVideo === post._id;
                                      const shouldPlay = isProfileTab || currentlyHovered;
                                      
                                      if (shouldPlay) {
                                        video.play().catch(() => {});
                                      } else {
                                        video.pause();
                                      }
                                    }
                                  }}
                                >
                                  {safeUrl && <source src={safeUrl} type="video/mp4" />}
                                </video>
                                
                                {/* Play icon overlay - only show for saved tab when paused */}
                                {activeTab === 'saved' && (
                                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${shouldShowVideo ? 'opacity-0' : 'opacity-100'}`}>
                                    <div className="bg-black/50 rounded-full p-3">
                                      <Play className="w-6 h-6 text-white fill-white" />
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <Image
                                src={safeUrl || safeThumb || '/placeholderimg.png'}
                                alt="Post content"
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            )}
                          </div>
                        );
                      })
                    ) : (
                      // Single media or non-saved tabs (original logic)
                      (() => {
                        const mediaIndex = activeTab === 'saved' ? getCurrentImageIndex(post._id) : 0;
                        const currentMedia = post.media[mediaIndex] || post.media[0];
                        const rawUrl = typeof currentMedia?.url === 'string' ? currentMedia.url.trim() : '';
                        const safeUrl = rawUrl.length > 0 ? rawUrl : undefined;
                        const rawThumb = typeof currentMedia?.thumbnailUrl === 'string' ? currentMedia.thumbnailUrl.trim() : '';
                        const safeThumb = rawThumb.length > 0 ? rawThumb : '/placeholderimg.png';
                        const isVideo = currentMedia?.type === 'video' && !!safeUrl;
                        
                        if (isVideo) {
                          const isReelTab = activeTab === 'reels';
                          const isSavedTab = activeTab === 'saved';
                          const isProfileTab = activeTab === 'posts' || activeTab === 'videos';
                          const isHovered = hoveredVideo === post._id;
                          // For profile tabs (posts/videos), play video automatically without hover requirement
                          // For reels/saved tabs, keep original hover behavior
                          const shouldShowVideo = isProfileTab || ((isReelTab || isSavedTab) && isHovered);
                          
                          if (isReelTab) {
                            // Original reels logic - no thumbnail poster
                            return (
                              <div className="relative w-full" style={{ paddingBottom: '177.78%' }}>
                                <video
                                  className="absolute inset-0 w-full h-full object-contain"
                                  muted
                                  loop
                                  playsInline
                                  preload="auto"
                                  ref={(video) => {
                                    if (video) {
                                      video.load();
                                      if (shouldShowVideo) {
                                        video.play().catch(() => {});
                                      } else {
                                        video.pause();
                                        video.currentTime = 0;
                                      }
                                    }
                                  }}
                                >
                                  {safeUrl && <source src={safeUrl} type="video/mp4" />}
                                </video>
                                
                                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${shouldShowVideo ? 'opacity-0' : 'opacity-100'}`}>
                                  <div className="bg-black/50 rounded-full p-3">
                                    <Play className="w-6 h-6 text-white fill-white" />
                                  </div>
                                </div>
                              </div>
                            );
                          } else if (isSavedTab) {
                            // Saved videos logic - square aspect ratio with cover cropping
                            return (
                              <>
                                <video
                                  className="w-full h-full object-cover"
                                  muted
                                  loop
                                  playsInline
                                  preload="metadata"
                                  data-post-id={post._id}
                                  data-media-index={mediaIndex}
                                  ref={(video) => {
                                    if (video) {
                                      video.load();
                                      
                                      video.addEventListener('loadedmetadata', () => {
                                        video.currentTime = 0.1;
                                      });
                                      
                                      video.addEventListener('canplay', () => {
                                        const currentlyHovered = hoveredVideo === post._id;
                                        if (!currentlyHovered) {
                                          video.pause();
                                        } else {
                                          video.play().catch(() => {});
                                        }
                                      });
                                      
                                      // Initial state based on current hover
                                      const currentlyHovered = hoveredVideo === post._id;
                                      if (currentlyHovered) {
                                        video.play().catch(() => {});
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
                              </>
                            );
                          } else if (isProfileTab) {
                            // Profile tab videos - auto-play without poster, no hover needed
                            return (
                              <>
                                <video
                                  className="w-full h-full object-cover"
                                  muted
                                  loop
                                  autoPlay
                                  playsInline
                                  preload="auto"
                                  ref={(video) => {
                                    if (video) {
                                      video.load();
                                      video.play().catch(() => {
                                        // If autoplay fails, still try to play when loaded
                                        video.addEventListener('loadeddata', () => {
                                          video.play().catch(() => {});
                                        });
                                      });
                                    }
                                  }}
                                >
                                  {safeUrl && <source src={safeUrl} type="video/mp4" />}
                                </video>
                              </>
                            );
                          } else {
                            // Non-reel videos (fallback)
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
                      })()
                    )}
                    
                    {/* Multiple media navigation - only show for saved tab and multiple images */}
                    {activeTab === 'saved' && post.media.length > 1 && (
                      <>
                        {/* Previous button */}
                        <button
                          onClick={(e) => handlePreviousImage(post, e)}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-1 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeft className="w-4 h-4 text-white" />
                        </button>

                        {/* Next button */}
                        <button
                          onClick={(e) => handleNextImage(post, e)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-1 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="w-4 h-4 text-white" />
                        </button>

                        {/* Dots indicator */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          {post.media.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                index === getCurrentImageIndex(post._id)
                                  ? 'bg-white'
                                  : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Multiple media indicator for other tabs */}
                    {activeTab !== 'saved' && post.media.length > 1 && (
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

                        {/* Privacy Toggle Button - for saved posts in own profile */}
                        {activeTab === 'saved' && !isOtherUser && (
                          <button
                            onClick={(e) => handlePrivacyToggle(post, e)}
                            className={`flex items-center space-x-1 p-1 rounded-lg transition-colors ${
                              getPostPrivacy(post) === 'public'
                                ? 'text-green-600 hover:text-green-700'
                                : 'text-gray-600 hover:text-gray-700'
                            }`}
                            title={`Currently ${getPostPrivacy(post)} - click to toggle`}
                          >
                            {getPostPrivacy(post) === 'public' ? (
                              <Eye className="w-5 h-5" />
                            ) : (
                              <EyeOff className="w-5 h-5" />
                            )}
                            <span className="text-xs font-medium capitalize">{getPostPrivacy(post)}</span>
                          </button>
                        )}

                        {/* Privacy Toggle Button - for user's own posts (posts, reels, videos tabs) */}
                        {activeTab !== 'saved' && !isOtherUser && (
                          <button
                            onClick={(e) => handlePostPrivacyToggle(post, e)}
                            disabled={isTogglingPostPrivacy[post._id]}
                            className={`flex items-center space-x-1 p-1 rounded-lg transition-colors disabled:opacity-50 ${
                              getRegularPostPrivacy(post) === 'public'
                                ? 'text-green-600 hover:text-green-700'
                                : 'text-gray-600 hover:text-gray-700'
                            }`}
                            title={`Currently ${getRegularPostPrivacy(post)} - click to toggle`}
                          >
                            {getRegularPostPrivacy(post) === 'public' ? (
                              <Eye className="w-5 h-5" />
                            ) : (
                              <EyeOff className="w-5 h-5" />
                            )}
                            <span className="text-xs font-medium capitalize">
                              {isTogglingPostPrivacy[post._id] ? 'Updating...' : getRegularPostPrivacy(post)}
                            </span>
                          </button>
                        )}
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