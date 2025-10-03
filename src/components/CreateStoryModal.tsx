"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, Upload, Camera, Image as ImageIcon, Video, Send, Play, Pause, RotateCcw } from "lucide-react";
import { toast } from 'react-toastify';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (media: File, caption?: string) => Promise<boolean>;
}

export default function CreateStoryModal({ isOpen, onClose, onUpload }: CreateStoryModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [imageScrollable, setImageScrollable] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const captionInputRef = useRef<HTMLTextAreaElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const isVideo = selectedFile?.type.startsWith('video/');
  const maxFileSize = 50 * 1024 * 1024; // 50MB
  const maxVideoDuration = 30; // 30 seconds

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file size
    if (file.size > maxFileSize) {
      setError("File size must be less than 50MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError("Please select an image or video file");
      return;
    }

    // For videos, validate duration and set up preview
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        setVideoDuration(video.duration);
        
        // Always allow the video, but we'll trim it to 30s in the preview
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        
        if (video.duration > maxVideoDuration) {
          // Show warning but don't reject the video
          setError(`Video is ${Math.ceil(video.duration)}s long. Only the first ${maxVideoDuration}s will be used for your story.`);
        }
      };
      
      video.src = URL.createObjectURL(file);
    } else {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImageScrollable(false); // Reset scroll state for new image
    }
  }, []);

  // Video control functions
  const toggleVideoPlayback = useCallback(() => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  }, [isVideoPlaying]);

  const resetVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setVideoCurrentTime(0);
      setIsVideoPlaying(false);
    }
  }, []);

  // Handle video events
  const handleVideoLoadedData = useCallback(() => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      // Ensure video doesn't play beyond 30 seconds
      videoRef.current.addEventListener('timeupdate', () => {
        if (videoRef.current && videoRef.current.currentTime >= maxVideoDuration) {
          videoRef.current.pause();
          videoRef.current.currentTime = maxVideoDuration;
          setIsVideoPlaying(false);
        }
        setVideoCurrentTime(videoRef.current?.currentTime || 0);
      });
    }
  }, []);

  const handleVideoEnded = useCallback(() => {
    setIsVideoPlaying(false);
  }, []);

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const success = await onUpload(selectedFile, caption || undefined);
      
      if (success) {
        // Show success toast
        toast.success('Story shared successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Close modal after successful upload
        cleanup();
        setSelectedFile(null);
        setPreviewUrl(null);
        setCaption("");
        setError(null);
        setShowCaptionInput(false);
        setImageScrollable(false);
        setIsVideoPlaying(false);
        setVideoCurrentTime(0);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Close the modal
        onClose();
      } else {
        setError("Failed to upload story. Please try again.");
        
        // Show error toast
        toast.error('Failed to upload story. Please try again.', {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      setError("An error occurred while uploading");
      console.error("Upload error:", err);
      
      // Show error toast
      toast.error('Failed to upload story. Please try again.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Clean up preview URL
  const cleanup = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  // Handle modal close
  const handleClose = () => {
    cleanup();
    onClose();
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/40 bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Prevent modal from closing when clicking backdrop
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl max-w-sm w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => {
          // Prevent clicks inside modal from bubbling up
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">Your Story</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isUploading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!selectedFile ? (
            /* File Selection */
            <div className="p-4">
              <div className="space-y-4">
                <div className="text-center">
                <p className="text-gray-600 mb-4">Share a moment with your story</p>
                
                {/* Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Upload size={48} className="text-gray-400" />
                    <p className="text-gray-600">Choose photo or video</p>
                    <p className="text-sm text-gray-400">Up to 50MB • Videos up to 30s</p>
                  </div>
                </button>

                {/* File Type Buttons */}
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <ImageIcon size={20} />
                    <span>Photo</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Video size={20} />
                    <span>Video</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>
            </div>
          ) : (
            /* Preview and Upload */
            <div className="flex flex-col h-full">
              {/* Preview Container - Instagram-like */}
              <div className="mx-4 mt-4">
                <div className="relative aspect-[9/16] bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden max-h-[60vh]">
                {/* Media Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {isVideo ? (
                    <>
                      <video
                        ref={videoRef}
                        src={previewUrl!}
                        className="max-w-full max-h-full object-contain"
                        onLoadedData={handleVideoLoadedData}
                        onEnded={handleVideoEnded}
                        muted
                        playsInline
                      />
                      
                      {/* Video Controls Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                        <button
                          onClick={toggleVideoPlayback}
                          className="bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all transform hover:scale-105"
                          disabled={isUploading}
                        >
                          {isVideoPlaying ? (
                            <Pause size={24} className="text-gray-800" />
                          ) : (
                            <Play size={24} className="text-gray-800 ml-1" />
                          )}
                        </button>
                      </div>

                      {/* Video Progress Bar */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white bg-opacity-30 rounded-full h-1">
                          <div 
                            className="bg-white rounded-full h-1 transition-all"
                            style={{ 
                              width: `${Math.min(100, (videoCurrentTime / Math.min(videoDuration, maxVideoDuration)) * 100)}%` 
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-white text-xs mt-1">
                          <span>{Math.floor(videoCurrentTime)}s</span>
                          <span>{Math.min(Math.floor(videoDuration), maxVideoDuration)}s</span>
                        </div>
                      </div>

                      {/* Video Reset Button */}
                      <button
                        onClick={resetVideo}
                        className="absolute top-4 left-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
                        disabled={isUploading}
                      >
                        <RotateCcw size={16} />
                      </button>
                    </>
                  ) : (
                    <div 
                      ref={imageContainerRef}
                      className="w-full h-full overflow-auto scrollbar-thin scrollbar-thumb-white/50 scrollbar-track-transparent relative scroll-smooth"
                      style={{ scrollBehavior: 'smooth' }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={previewUrl!}
                          alt="Story preview"
                          className="object-contain max-w-full max-h-full"
                          style={{ 
                            width: 'auto',
                            height: 'auto',
                            maxWidth: '100%',
                            maxHeight: '100%'
                          }}
                          onLoad={(e) => {
                            const img = e.target as HTMLImageElement;
                            const container = imageContainerRef.current;
                            if (container) {
                              // Always fit the image within the container maintaining aspect ratio
                              const containerWidth = container.clientWidth;
                              const containerHeight = container.clientHeight;
                              const imageAspectRatio = img.naturalWidth / img.naturalHeight;
                              const containerAspectRatio = containerWidth / containerHeight;
                              
                              if (imageAspectRatio > containerAspectRatio) {
                                // Image is wider, fit to width
                                img.style.width = '100%';
                                img.style.height = 'auto';
                              } else {
                                // Image is taller, fit to height
                                img.style.height = '100%';
                                img.style.width = 'auto';
                              }
                              
                              // No need for scroll indicators as image is always fitted
                              setImageScrollable(false);
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Change File Button */}
                <button
                  onClick={() => {
                    cleanup();
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setCaption("");
                    setError(null);
                    setShowCaptionInput(false);
                    setImageScrollable(false);
                  }}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
                  disabled={isUploading}
                >
                  <X size={16} />
                </button>

                {/* Caption Overlay (if exists) */}
                {caption && (
                  <div className="absolute bottom-16 left-4 right-4">
                    <div className="bg-white bg-opacity-90 rounded-lg p-3">
                      <p className="text-black text-sm font-medium">{caption}</p>
                    </div>
                  </div>
                )}

                {/* Add Caption Button */}
                <button
                  onClick={() => {
                    setShowCaptionInput(true);
                    setTimeout(() => captionInputRef.current?.focus(), 100);
                  }}
                  className="absolute bottom-4 right-4 bg-white bg-opacity-90 text-gray-800 rounded-full px-4 py-2 text-sm font-medium hover:bg-opacity-100 transition-all"
                  disabled={isUploading || showCaptionInput}
                >
                  {caption ? 'Edit Caption' : 'Add Caption'}
                </button>
                </div>
              </div>

              {/* Caption Input (Slide Up) */}
              {showCaptionInput && (
                <div className="bg-gray-50 p-4 border-t animate-in slide-in-from-bottom">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Add a caption</h4>
                      <button
                        onClick={() => setShowCaptionInput(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <textarea
                      ref={captionInputRef}
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Write a caption..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                      rows={3}
                      maxLength={500}
                      disabled={isUploading}
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        {caption.length}/500 characters
                      </p>
                      <button
                        onClick={() => setShowCaptionInput(false)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Spacer to push button to bottom */}
              <div className="flex-1"></div>

              {/* Error Message */}
              {error && (
                <div className="mx-4 mb-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-amber-800 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Share Button - Always at bottom */}
        {selectedFile && (
          <div className="p-4 border-t bg-white flex-shrink-0">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[0.98] active:scale-95"
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Share to Story</span>
                    </>
                  )}
                </button>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}