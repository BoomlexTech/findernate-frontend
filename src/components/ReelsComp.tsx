"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Volume2, VolumeX, Heart, MessageCircle, Share, MoreVertical, ChevronUp, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { getReels } from '@/api/reels';

interface Reel {
  id: number;
  videoUrl: string;
  thumbnail: string;
  user: {
    name: string;
    avatar: string;
  };
  description: string;
  likes: number;
  comments: number;
  shares: number;
  music: string;
}

interface ReelsComponentProps {
  reelsData?: Reel[];
}

const ReelsComponent: React.FC<ReelsComponentProps> = ({ reelsData = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [likes, setLikes] = useState<Record<number, boolean>>({});
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  // Sample data structure - replace with your backend data
  const defaultReelsData: Reel[] = [
    {
      id: 1,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=600&fit=crop",
      user: {
        name: "johndoe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
      },
      description: "Amazing sunset view from the mountains! 🌅 #nature #sunset",
      likes: 1250,
      comments: 89,
      shares: 45,
      music: "Original Audio - johndoe"
    },
    {
      id: 2,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=600&fit=crop",
      user: {
        name: "traveler_jane",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c371?w=40&h=40&fit=crop&crop=face"
      },
      description: "Coffee art that took 3 hours to perfect ☕✨ #latte #coffeeart",
      likes: 890,
      comments: 67,
      shares: 23,
      music: "Chill Vibes - Background Music"
    },
    {
      id: 3,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop",
      user: {
        name: "adventure_max",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
      },
      description: "Epic mountain climbing adventure! The view was worth every step 🏔️ #climbing #adventure",
      likes: 2100,
      comments: 156,
      shares: 78,
      music: "Epic Adventure - Soundtrack"
    }
  ];

  useEffect(() => {
    async function fetchReels() {
      setLoading(true);
      try {
        const res = await getReels();
        const apiReels = res?.reels;
        console.log('API reels response:', apiReels);
        // Map API response to Reel interface
        const mappedReels: Reel[] = Array.isArray(apiReels)
          ? apiReels.map((item: any, idx: number) => ({
              id: idx + 1,
              videoUrl: item.secure_url || item.url,
              thumbnail: '', // No thumbnail in API, can use a placeholder or generate from video
              user: {
                name: 'Unknown', // No user info in API, can update if available
                avatar: '/placeholderimg.png',
              },
              description: item.display_name || '',
              likes: Math.floor(Math.random() * 1000), // Placeholder
              comments: Math.floor(Math.random() * 100), // Placeholder
              shares: Math.floor(Math.random() * 50), // Placeholder
              music: '', // No music info in API
            }))
          : [];
        setReels(mappedReels.length > 0 ? mappedReels : defaultReelsData);
      } catch (err) {
        console.log(err);
        setReels(defaultReelsData);
      } finally {
        setLoading(false);
      }
    }
    fetchReels();
  }, []);

  // Handle video play/pause based on current index
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex && isPlaying) {
          video.play().catch(console.error);
        } else {
          video.pause();
        }
      }
    });
  }, [currentIndex, isPlaying]);

  // Handle mute/unmute
  useEffect(() => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      currentVideo.muted = isMuted;
    }
  }, [isMuted, currentIndex]);

  // Scroll to current reel
  const scrollToReel = useCallback((index: number) => {
    if (containerRef.current) {
      const container = containerRef.current;
      const targetScrollTop = index * container.clientHeight;
      container.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  }, []);

  // Handle touch events for swipe navigation
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartY.current || !touchEndY.current) return;
    
    const diff = touchStartY.current - touchEndY.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < reels.length - 1) {
        // Swipe up - next reel
        navigateToReel(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe down - previous reel
        navigateToReel(currentIndex - 1);
      }
    }

    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  // Navigate to specific reel
  const navigateToReel = (index: number) => {
    if (index >= 0 && index < reels.length) {
      setCurrentIndex(index);
      scrollToReel(index);
    }
  };

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / containerHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, reels.length]);

  // Toggle like
  const toggleLike = (reelId: number) => {
    setLikes(prev => ({
      ...prev,
      [reelId]: !prev[reelId]
    }));
  };

  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="relative w-full max-w-sm mx-auto h-[98vh] rounded-2xl bg-black overflow-hidden">
      {loading && reels.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-30">
          <div className="text-white text-lg">Loading reels...</div>
        </div>
      )}
      {/* Navigation arrows */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => navigateToReel(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="p-2 bg-black/50 rounded-full text-white disabled:opacity-30 transition-opacity"
        >
          <ChevronUp size={20} />
        </button>
        <button
          onClick={() => navigateToReel(currentIndex + 1)}
          disabled={currentIndex === reels.length - 1}
          className="p-2 bg-black/50 rounded-full text-white disabled:opacity-30 transition-opacity"
        >
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Reels container */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className="relative h-screen w-full snap-start flex-shrink-0"
          >
            {/* Video */}
            <video
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              className="w-full h-full object-cover"
              src={reel.videoUrl}
              poster={reel.thumbnail}
              loop
              playsInline
              muted={isMuted}
              autoPlay={index === currentIndex}
              style={{ display: index === currentIndex ? 'block' : 'none' }}
              onClick={() => setIsPlaying(!isPlaying)}
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Play/Pause button */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(true)}
                  className="p-4 bg-black/50 rounded-full text-white"
                >
                  <Play size={32} fill="white" />
                </button>
              </div>
            )}

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="flex justify-between items-end">
                {/* Left side - User info and description */}
                <div className="flex-1 mr-4">
                  {/* User info */}
                  <div className="flex items-center mb-3">
                    <Image
                      src={reel.user.avatar || '/placeholderimg.png'}
                      alt={reel.user.name}
                      className="w-8 h-8 rounded-full mr-2 object-cover"
                      width={32}
                      height={32}
                    />
                    <span className="font-semibold text-sm">@{reel.user.name}</span>
                    <button className="ml-3 px-3 py-1 bg-yellow-500 rounded-full text-xs font-semibold">
                      Follow
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-sm mb-2 leading-relaxed">
                    {reel.description}
                  </p>

                  {/* Music info */}
                  <div className="flex items-center text-xs opacity-80">
                    <span className="mr-2">🎵</span>
                    <span className="truncate">{reel.music}</span>
                  </div>
                </div>

                {/* Right side - Action buttons */}
                <div className="flex flex-col items-center space-y-4">
                  {/* Like button */}
                  <button
                    onClick={() => toggleLike(reel.id)}
                    className="flex flex-col items-center"
                  >
                    <div className="p-3 bg-black/30 rounded-full mb-1">
                      <Heart
                        size={24}
                        className={likes[reel.id] ? 'text-red-500 fill-red-500' : 'text-white'}
                      />
                    </div>
                    <span className="text-xs text-center">
                      {formatNumber(reel.likes + (likes[reel.id] ? 1 : 0))}
                    </span>
                  </button>

                  {/* Comment button */}
                  <button className="flex flex-col items-center">
                    <div className="p-3 bg-black/30 rounded-full mb-1">
                      <MessageCircle size={24} className="text-white" />
                    </div>
                    <span className="text-xs text-center">
                      {formatNumber(reel.comments)}
                    </span>
                  </button>

                  {/* Share button */}
                  <button className="flex flex-col items-center">
                    <div className="p-3 bg-black/30 rounded-full mb-1">
                      <Share size={24} className="text-white" />
                    </div>
                    <span className="text-xs text-center">
                      {formatNumber(reel.shares)}
                    </span>
                  </button>

                  {/* More options */}
                  <button className="flex flex-col items-center">
                    <div className="p-3 bg-black/30 rounded-full mb-1">
                      <MoreVertical size={24} className="text-white" />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Top controls */}
            <div className="absolute top-4 left-4 right-16 flex justify-between items-center z-10">
              <div className="text-white text-sm font-semibold">
                Reels
              </div>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 bg-black/30 rounded-full text-white"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>

          </div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ReelsComponent;