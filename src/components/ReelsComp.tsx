"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';
import { getReels } from '@/api/reels';

interface Reel {
  id: number;
  videoUrl: string;
  thumbnail: string;
}

interface ReelsComponentProps {
  reelsData?: Reel[];
  onReelChange?: (index: number) => void;
  apiReelsData?: any[]; // Accept reels data from parent component
  onLikeToggle?: () => Promise<void>;
  onCommentClick?: () => void;
  onShareClick?: () => void;
  onSaveToggle?: () => Promise<void>;
  onMoreClick?: () => void;
  isLiked?: boolean;
  isSaved?: boolean;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  isMobile?: boolean;
  username?: string;
  description?: string;
  hashtags?: any;
}

const ReelsComponent: React.FC<ReelsComponentProps> = ({ 
  onReelChange, 
  apiReelsData,
  onLikeToggle,
  onCommentClick,
  onShareClick,
  onSaveToggle,
  onMoreClick,
  isLiked,
  isSaved,
  likesCount,
  commentsCount,
  sharesCount,
  isMobile,
  username,
  description,
  hashtags
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const playPromises = useRef<Map<number, Promise<void>>>(new Map());
  const playTimeouts = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Default fallback videos
  const defaultReelsData: Reel[] = [
    {
      id: 1,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnail: ""
    },
    {
      id: 2,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnail: ""
    },
    {
      id: 3,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnail: ""
    }
  ];

  useEffect(() => {
    if (apiReelsData && apiReelsData.length > 0) {
      console.log('Processing API reels data:', apiReelsData);
      // Map API reels data to Reel interface, extracting video URLs from media array
      const mappedReels: Reel[] = apiReelsData.map((item: any, idx: number) => {
        // Find the first video media item or any media with URL
        const videoMedia = item.media?.find((m: any) => m.type === 'video' || m.url) || item.media?.[0];
        
        // Log each reel's media structure for debugging
        console.log(`Reel ${idx + 1} media:`, item.media);
        console.log(`Selected video media:`, videoMedia);
        
        return {
          id: idx + 1,
          videoUrl: videoMedia?.url || defaultReelsData[idx % defaultReelsData.length].videoUrl,
          thumbnail: videoMedia?.thumbnailUrl || videoMedia?.thumbnail || ''
        };
      });
      
      console.log('Mapped reels:', mappedReels);
      setReels(mappedReels);
      setLoading(false);
    } else {
      // Fallback to API call if no data provided
      async function fetchReels() {
        setLoading(true);
        try {
          const res = await getReels();
          const apiReels = res?.reels;
          console.log('API reels response:', apiReels);
          // Map API response to Reel interface
          const mappedReels: Reel[] = Array.isArray(apiReels)
            ? apiReels.map((item: any, idx: number) => {
                // Handle both old format (direct URL) and new format (media array)
                let videoUrl = '';
                let thumbnail = '';

                if (item.media && item.media.length > 0) {
                  // New format: media array
                  const videoMedia = item.media.find((m: any) => m.type === 'video' || m.url) || item.media[0];
                  videoUrl = videoMedia?.url || '';
                  thumbnail = videoMedia?.thumbnailUrl || videoMedia?.thumbnail || '';
                } else if (item.secure_url || item.url) {
                  // Old format: direct URL
                  videoUrl = item.secure_url || item.url;
                  thumbnail = '';
                }

                // Fallback to default if no valid URL found
                if (!videoUrl) {
                  videoUrl = defaultReelsData[idx % defaultReelsData.length].videoUrl;
                }

                console.log(`Fallback reel ${idx + 1} media:`, { videoUrl, thumbnail });
                return {
                  id: idx + 1,
                  videoUrl,
                  thumbnail
                };
              })
            : [];
          console.log('Fallback mapped reels:', mappedReels);
          setReels(mappedReels.length > 0 ? mappedReels : defaultReelsData);
        } catch (err) {
          console.log('Error fetching reels:', err);
          setReels(defaultReelsData);
        } finally {
          setLoading(false);
        }
      }
      fetchReels();
    }
  }, [apiReelsData]);

  // Safely play video with promise handling and debouncing
  const safePlay = async (video: HTMLVideoElement, index: number) => {
    // Clear any existing timeout for this video
    const existingTimeout = playTimeouts.current.get(index);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      playTimeouts.current.delete(index);
    }

    // Cancel any existing play promise for this video
    const existingPromise = playPromises.current.get(index);
    if (existingPromise) {
      video.pause(); // This will reject the existing promise, which we'll catch
      playPromises.current.delete(index);
    }

    // Add a small delay to prevent rapid play/pause calls
    const timeout = setTimeout(async () => {
      try {
        playTimeouts.current.delete(index);
        
        // Create new play promise
        const playPromise = video.play();
        playPromises.current.set(index, playPromise);
        
        await playPromise;
        
        // Clean up promise after successful play
        playPromises.current.delete(index);
      } catch (error) {
        // Clean up promise on error
        playPromises.current.delete(index);
        
        // Only log errors that aren't related to play/pause interruptions
        if (error instanceof DOMException) {
          // Ignore common interruption errors
          if (error.name === 'AbortError' || 
              error.name === 'NotAllowedError' ||
              error.message.includes('interrupted')) {
            // These are expected when scrolling quickly through videos
            return;
          }
          console.error('Video play error:', error);
        } else {
          console.error('Unexpected video error:', error);
        }
      }
    }, 100); // 100ms delay

    playTimeouts.current.set(index, timeout);
  };

  // Safely pause video
  const safePause = (video: HTMLVideoElement, index: number) => {
    // Cancel any pending timeout
    const existingTimeout = playTimeouts.current.get(index);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      playTimeouts.current.delete(index);
    }

    // Cancel any pending play promise
    const existingPromise = playPromises.current.get(index);
    if (existingPromise) {
      playPromises.current.delete(index);
    }
    
    video.pause();
  };

  // Handle video play/pause based on current index
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex && isPlaying) {
          safePlay(video, index);
        } else {
          safePause(video, index);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Pause all videos and clear promises/timeouts on unmount
      videoRefs.current.forEach((video, index) => {
        if (video) {
          safePause(video, index);
        }
      });
      
      // Clear all remaining timeouts and promises
      playTimeouts.current.forEach(timeout => clearTimeout(timeout));
      playTimeouts.current.clear();
      playPromises.current.clear();
    };
  }, []);

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
        setCurrentIndex(currentIndex + 1);
        scrollToReel(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        scrollToReel(currentIndex - 1);
      }
    }

    touchStartY.current = 0;
    touchEndY.current = 0;
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
      // Notify parent component about reel change
      if (onReelChange) {
        onReelChange(newIndex);
      }
    }
  }, [currentIndex, reels.length, onReelChange]);

  return (
    <div className="relative w-96 mx-auto aspect-[9/16] flex-shrink-0">
      {/* Video container with overflow hidden */}
      <div className="absolute inset-0 rounded-2xl bg-black overflow-hidden shadow-2xl">
        
        {/* Up/Down Scroll Buttons - Overlaid on the reel video */}
        <button
          className="absolute right-4 top-1/3 z-[9999] bg-black/30 hover:bg-black/50 rounded-full p-3 shadow-lg transition-colors disabled:opacity-40"
          style={{ transform: 'translateY(-50%)' }}
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
              scrollToReel(currentIndex - 1);
            }
          }}
          disabled={currentIndex === 0}
          aria-label="Scroll Up"
        >
          <ChevronUp size={28} className="text-white opacity-90 drop-shadow-lg" />
        </button>
        <button
          className="absolute right-4 bottom-1/3 z-[9999] bg-black/30 hover:bg-black/50 rounded-full p-3 shadow-lg transition-colors disabled:opacity-40"
          style={{ transform: 'translateY(50%)' }}
          onClick={() => {
            if (currentIndex < reels.length - 1) {
              setCurrentIndex(currentIndex + 1);
              scrollToReel(currentIndex + 1);
            }
          }}
          disabled={currentIndex === reels.length - 1}
          aria-label="Scroll Down"
        >
          <ChevronDown size={28} className="text-white opacity-100 " />
        </button>

      {loading && reels.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-30">
          <div className="text-white text-lg">Loading reels...</div>
        </div>
      )}

      {/* Reels container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className="relative h-full w-full snap-start flex-shrink-0"
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
              onClick={() => {
                const video = videoRefs.current[index];
                if (video) {
                  if (isPlaying) {
                    safePause(video, index);
                    setIsPlaying(false);
                  } else {
                    safePlay(video, index);
                    setIsPlaying(true);
                  }
                }
              }}
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />


            {/* Play/Pause button */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => {
                    const video = videoRefs.current[currentIndex];
                    if (video) {
                      safePlay(video, currentIndex);
                      setIsPlaying(true);
                    }
                  }}
                  className="p-4 bg-black/50 rounded-full text-white"
                >
                  <Play size={32} fill="white" />
                </button>
              </div>
            )}

            {/* Top controls - Only mute button */}
            <div className="absolute top-4 right-4 z-10">
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