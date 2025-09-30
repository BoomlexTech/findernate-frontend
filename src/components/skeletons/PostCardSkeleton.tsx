"use client";

import React from 'react';

const PostCardSkeleton = () => {
  return (
    <div className="relative">
      <div className="w-full bg-white rounded-none sm:rounded-3xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
        {/* Desktop Layout: Media + Info Side-by-Side | Mobile Layout: Stacked */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 p-3">
          
          {/* Mobile: User Profile and Name with Location (Top Section) */}
          <div className="md:hidden flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {/* Profile Image */}
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              
              {/* User Info */}
              <div>
                <div className="flex gap-2 items-center">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-16 mt-1"></div>
              </div>
            </div>

            {/* Mobile: Three Dot Menu */}
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
          </div>

          {/* Mobile: Business/Service/Product Details Placeholder */}
          <div className="md:hidden mb-2">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>

          {/* Media Section */}
          <div className="relative w-full md:w-[21rem] md:flex-shrink-0 overflow-hidden rounded-2xl bg-gray-300" style={{ height: '400px' }}>
            {/* Media Count Indicator */}
            <div className="absolute top-2 left-2 bg-gray-400 rounded-full w-12 h-5"></div>
            
            {/* Navigation Controls */}
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-400 rounded-full w-7 h-7"></div>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-400 rounded-full w-7 h-7"></div>
            
            {/* Dots Indicator */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
            </div>
          </div>

          {/* Desktop: Profile + Info - Hidden on mobile */}
          <div className="hidden md:flex flex-col justify-start flex-1 space-y-1 relative pb-16">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {/* Desktop Profile Image */}
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                
                {/* Desktop User Info */}
                <div>
                  <div className="flex gap-2">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-20 mt-1"></div>
                </div>
              </div>

              {/* Desktop: Three Dot Menu */}
              <div className="w-5 h-5 bg-gray-300 rounded"></div>
            </div>

            {/* Desktop: Caption */}
            <div className="space-y-2 mt-2">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>

            {/* Desktop: Business/Service/Product Details */}
            <div className="h-16 bg-gray-200 rounded-lg mt-3"></div>

            {/* Desktop: Hashtags */}
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="h-3 bg-gray-200 rounded w-12"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-10"></div>
            </div>

            {/* Desktop: Engagement buttons - absolute positioned */}
            <div className="absolute bottom-0 w-full pr-20 sm:pr-24">
              <div className="flex items-center space-x-4">
                {/* Like Button */}
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-6"></div>
                </div>
                
                {/* Comment Button */}
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-6"></div>
                </div>
                
                {/* Share Button */}
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-6"></div>
                </div>
              </div>
            </div>
            
            {/* Desktop: Timestamp */}
            <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>

          {/* Mobile: Content Below Media */}
          <div className="md:hidden space-y-2">
            {/* Mobile: Caption */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>

            {/* Mobile: Hashtags */}
            <div className="flex flex-wrap gap-2 mb-2">
              <div className="h-3 bg-gray-200 rounded w-12"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-10"></div>
            </div>

            {/* Mobile: Engagement Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Like Button */}
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-6"></div>
                </div>
                
                {/* Comment Button */}
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-6"></div>
                </div>
                
                {/* Share Button */}
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-6"></div>
                </div>
              </div>
              
              {/* Mobile: Timestamp */}
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCardSkeleton;