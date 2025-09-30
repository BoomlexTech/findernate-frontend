"use client";

import React from 'react';

const StorySkeletonItem = ({ showPlusIcon = false }: { showPlusIcon?: boolean }) => (
  <div className="flex flex-col items-center mt-5 flex-shrink-0 animate-pulse">
    <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-gray-300">
      <div className="w-full h-full rounded-full overflow-hidden">
        <div className="w-full h-full bg-gray-300 rounded-full"></div>
      </div>
      
      {/* Plus icon for "Add Story" skeleton */}
      {showPlusIcon && (
        <div 
          className="absolute bottom-0 right-0 w-5 h-5 bg-gray-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center z-20"
          style={{
            transform: 'translate(30%, 30%)'
          }}
        >
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        </div>
      )}
    </div>
    <div className="h-3 bg-gray-300 rounded w-12 sm:w-16 max-w-[48px] sm:max-w-[64px] mt-2"></div>
  </div>
);

const StoriesBarSkeleton = () => {
  return (
    <div className="flex overflow-x-auto space-x-3 sm:space-x-6 pb-0 sm:pb-2 px-2 md:mx-3 lg:mx-4 bg-white shadow-md rounded-lg subtle-scrollbar animate-pulse">
      {/* Add Story Button Skeleton */}
      <StorySkeletonItem showPlusIcon={true} />

      {/* Story Items Skeletons */}
      {Array.from({ length: 7 }).map((_, index) => (
        <StorySkeletonItem key={index} />
      ))}
    </div>
  );
};

export default StoriesBarSkeleton;