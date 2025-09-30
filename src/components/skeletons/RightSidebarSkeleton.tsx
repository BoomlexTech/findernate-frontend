"use client";

import React from 'react';

const RightSidebarSkeleton = () => {
  return (
    <div className="p-6 h-full space-y-6 animate-pulse">
      {/* Login/Signup section skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="h-6 bg-gray-300 rounded w-32 mb-3"></div>
        <div className="flex gap-2">
          <div className="flex-1 h-8 bg-gray-300 rounded-lg"></div>
          <div className="flex-1 h-8 bg-gray-300 rounded-lg"></div>
        </div>
      </div>

      {/* Suggested Users section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header with icon and title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
          <div className="h-5 bg-gray-300 rounded w-32"></div>
        </div>
        {/* User list items */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center p-3 space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-8 bg-gray-300 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Business section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-6">
        {/* Header with icon and title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
          <div className="h-5 bg-gray-300 rounded w-40"></div>
        </div>
        {/* Business list items */}
        <div className="space-y-1 max-h-80">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-14"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebarSkeleton;