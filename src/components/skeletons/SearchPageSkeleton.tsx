"use client";

import React from 'react';
import PostCardSkeleton from './PostCardSkeleton';
import RightSidebarSkeleton from './RightSidebarSkeleton';
import LeftSidebarSkeleton from './LeftSidebarSkeleton';

export default function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Left Sidebar Skeleton - Hidden on mobile, visible on desktop */}
      <div className="w-64 fixed left-0 h-full bg-white border-r border-gray-200 overflow-y-auto hidden lg:block">
        <LeftSidebarSkeleton />
      </div>

      <div className="lg:ml-64 min-h-screen flex gap-6">
        <main className="flex-1 max-w-3xl mx-auto py-6 px-4 sm:px-6">
          <div className="space-y-4">
            {/* Search bar skeleton */}
            <div className="h-14 bg-gray-100 rounded-2xl w-full animate-pulse" />

            {/* Tabs skeleton */}
            <div className="flex items-center gap-3 mt-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 w-24 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>

            {/* Filters skeleton */}
            <div className="flex flex-wrap gap-2 mt-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-9 w-32 bg-gray-100 rounded-full animate-pulse" />
              ))}
            </div>

            {/* Users section skeleton (if search for users) */}
            <div className="mt-4 space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Post results skeletons */}
            <div className="space-y-4 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>

        <aside className="w-80 hidden xl:block">
          <div className="sticky top-6">
            <RightSidebarSkeleton />
          </div>
        </aside>
      </div>
    </div>
  );
}
