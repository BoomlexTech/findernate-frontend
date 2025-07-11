"use client";

import React, { useState } from 'react';
import TrendingTopics from '@/components/TrendingTopics';
import MainContent from '@/components/MainContent';
import TrendingBusiness from '@/components/TrendingBusiness';
import { TrendingUp, Flame, Star, Clock } from 'lucide-react';

const Page = () => {
  const [activeFilter, setActiveFilter] = useState('All Posts');
  
  const filters = [
    { name: 'All Posts', count: null },
    { name: 'Technology', count: 24 },
    { name: 'Business', count: 18 },
    { name: 'Design', count: 12 }
  ];

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-[#f8f9fa]">
      {/* Left Sidebar / Main Feed */}
      <div className="flex-1 p-4 md:pl-8 md:pr-6">
        {/* Enhanced Trending Posts Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/10 to-orange-500/10 rounded-full transform -translate-x-12 translate-y-12"></div>
            
            <div className="relative">
              {/* Main heading with icon */}
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:bg-[#DBB42C]/80 text-white rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Trending Posts
                </h1>
              </div>
              
              {/* Subtitle */}
              <p className="text-gray-600 text-lg mb-4">
                Discover what&apos;s popular in your network right now
              </p>
              
              {/* Stats row */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600">Hot topics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-600">Most liked</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">Updated 2 min ago</span>
                </div>
              </div>
              
              {/* Filter tabs */}
              <div className="flex flex-wrap gap-2 mt-4">
                {filters.map((filter) => (
                  <button
                    key={filter.name}
                    onClick={() => setActiveFilter(filter.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      activeFilter === filter.name
                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                    }`}
                  >
                    {filter.name}
                    {filter.count && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activeFilter === filter.name
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:bg-[#DBB42C]/80  text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {filter.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filter indicator */}
        {activeFilter !== 'All Posts' && (
          <div className="mb-4 p-3 bg-blue-10 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                Showing {activeFilter} posts
              </span>
              <button
                onClick={() => setActiveFilter('All Posts')}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Clear filter
              </button>
            </div>
          </div>
        )}

        <MainContent/>
      </div>
       
      {/* Right Sidebar / Trending Topics */}
      <aside className="w-full md:w-[320px] p-4 bg-white shadow-md rounded-lg md:sticky md:top-4 md:h-fit">
        <TrendingTopics />
        <TrendingBusiness />
      </aside>
    </div>
  );
};

export default Page;