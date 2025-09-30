"use client";

import React from 'react';
import StoriesBarSkeleton from './StoriesBarSkeleton';
import MainContentSkeleton from './MainContentSkeleton';
import RightSidebarSkeleton from './RightSidebarSkeleton';

const HomeFeedSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto flex">
        {/* Main Content Area */}
        <div className="flex-1 lg:pr-[23rem] pr-0">
          {/* Mobile Logo - Only visible on small screens */}
          <div className="lg:hidden pt-4 bg-white">
            <div className="flex justify-center w-full">
              <div className="h-12 sm:h-16 w-44 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Stories Bar Skeleton */}
          <div className="lg:top-0 lg:z-20 bg-gray-50 px-0">
            <StoriesBarSkeleton />
          </div>

          {/* Posts Skeleton */}
          <div className="overflow-y-auto">
            <MainContentSkeleton />
          </div>
        </div>

        {/* Right Sidebar Skeleton - Hidden on mobile and medium screens, Fixed on large desktop */}
        <div className="hidden lg:block w-[23rem] fixed right-0 top-0 h-full bg-white border-l border-gray-200 overflow-y-auto">
          <RightSidebarSkeleton />
        </div>
      </div>
    </div>
  );
};

export default HomeFeedSkeleton;