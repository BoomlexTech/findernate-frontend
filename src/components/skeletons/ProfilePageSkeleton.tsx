import React from 'react';

const ProfilePageSkeleton = () => {
  return (
    <div className="bg-gray-50 max-w-[1216px] mx-auto p-4 min-h-screen">
      <div className="flex flex-col gap-6 animate-pulse">
        {/* User Profile Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              {/* Name and verification */}
              <div className="space-y-2">
                <div className="h-7 bg-gray-200 rounded w-48"></div>
                <div className="h-5 bg-gray-200 rounded w-32"></div>
              </div>
              
              {/* Bio */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              
              {/* Stats */}
              <div className="flex gap-6">
                <div className="space-y-1">
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                  <div className="h-4 bg-gray-200 rounded w-18"></div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-20"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-10"></div>
              </div>
            </div>
          </div>
          
          {/* Business Info Section (if applicable) */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-5 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-5 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-5 bg-gray-200 rounded w-28"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-18"></div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-40"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white rounded-xl shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-100">
            <div className="flex gap-8 px-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="py-4">
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Posts Grid */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageSkeleton;
