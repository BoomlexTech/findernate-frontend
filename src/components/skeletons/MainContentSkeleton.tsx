"use client";

import React from 'react';
import PostCardSkeleton from './PostCardSkeleton';

const MainContentSkeleton = () => {
  return (
  <div className="max-w-3xl mx-auto py-4 px-0 sm:px-4">
      <div className="space-y-0 sm:space-y-6 mt-0 sm:mt-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

export default MainContentSkeleton;