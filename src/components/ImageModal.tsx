'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { FeedPost } from '@/types';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: FeedPost | null;
}

export default function ImageModal({ isOpen, onClose, post }: ImageModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Reset image index when post changes
  useEffect(() => {
    if (post) {
      setCurrentImageIndex(0);
      setVideoLoaded(false);
    }
  }, [post?._id]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentImageIndex]);

  const handlePrevious = () => {
    if (!post?.media || post.media.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? post.media.length - 1 : prev - 1
    );
    setVideoLoaded(false);
  };

  const handleNext = () => {
    if (!post?.media || post.media.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === post.media.length - 1 ? 0 : prev + 1
    );
    setVideoLoaded(false);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  if (!isOpen || !post) return null;

  const currentMedia = post.media?.[currentImageIndex];
  const hasMultipleMedia = post.media && post.media.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full mx-4 bg-white rounded-lg shadow-2xl overflow-hidden max-w-4xl max-h-[90vh]">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-end bg-gradient-to-b from-black/50 to-transparent p-4">
          <button
            onClick={onClose}
            className="rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Counter - Positioned at bottom right */}
        {hasMultipleMedia && (
          <div className="absolute bottom-4 right-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentImageIndex + 1} / {post.media.length}
          </div>
        )}

        {/* Media Container */}
        <div 
          className="relative w-full h-full flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {currentMedia && (
            <div className="w-full h-full flex items-center justify-center p-4 pt-8">
              {currentMedia.type === 'video' ? (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ 
                    minHeight: 'calc(90vh - 120px)',
                    minWidth: 'calc(100vw - 80px)'
                  }}
                >
                  <video
                    src={currentMedia.url}
                    controls
                    autoPlay
                    loop
                    muted
                    onLoadedMetadata={handleVideoLoad}
                    className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                      videoLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ 
                      maxHeight: 'calc(90vh - 120px)',
                      width: 'auto',
                      height: 'auto',
                      minWidth: '320px',
                      minHeight: '240px'
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                  {!videoLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src={currentMedia.url}
                    alt="Post image"
                    width={600}
                    height={400}
                    className="max-w-full max-h-full object-contain"
                    style={{ 
                      maxHeight: 'calc(60vh - 120px)',
                      maxWidth: 'calc(70vw - 80px)'
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {hasMultipleMedia && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Thumbnail Navigation */}
        {hasMultipleMedia && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/30 rounded-lg">
            {post.media.map((media, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                  index === currentImageIndex 
                    ? 'border-white scale-110' 
                    : 'border-transparent hover:border-white/50'
                }`}
              >
                {media.type === 'video' ? (
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <Image
                    src={media.url}
                    alt={`Thumbnail ${index + 1}`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
