"use client";

import React from 'react';

const LeftSidebarSkeleton = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Logo section skeleton */}
      <div className='sticky top-0 bg-white z-10 border-b pl-3 pr-6 pt-6 pb-4'>
        <div className="mb-4">
          <div className="flex items-center w-[13rem]">
            <div className="h-12 bg-gray-300 rounded w-[220px] animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Navigation skeleton */}
        <nav className="mb-8 mt-2">
          <ul className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <li key={index}>
                <div className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg animate-pulse">
                  <div className="w-6 h-6 bg-gray-300 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                  </div>
                  {/* Notification badge skeleton for some items */}
                  {(index === 3 || index === 4) && (
                    <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>

        {/* Create Post Button skeleton */}
        <div className="mb-8">
          <div className="flex gap-3 w-full h-[3rem] bg-gray-300 rounded-xl animate-pulse"></div>
        </div>

        {/* Discover Section skeleton */}
        <div>
          <div className="h-4 bg-gray-300 rounded w-20 mb-4 animate-pulse"></div>
          <ul className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <li key={index}>
                <div className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg animate-pulse">
                  <div className="w-6 h-6 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebarSkeleton;