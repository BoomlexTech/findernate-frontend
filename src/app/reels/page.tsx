'use client';

import ProductServiceDetails from '@/components/ProductServiceDetails'
import ReelsComponent from '@/components/ReelsComp'
import React from 'react'

const page = () => {
  // Mock post data - this will be replaced with reels API data when available
  const mockPost = {
    _id: '1',
    userId: {
      _id: 'user1',
      username: 'demo_user',
      profileImageUrl: '/default-avatar.png'
    },
    username: 'demo_user',
    profileImageUrl: '/default-avatar.png',
    description: 'Check out this amazing product/service',
    caption: 'Featured Product/Service',
    contentType: 'product',
    postType: 'product',
    createdAt: new Date().toISOString(),
    media: [],
    isLikedBy: false,
    likedBy: [],
    engagement: {
      comments: 0,
      impressions: 0,
      likes: 0,
      reach: 0,
      saves: 0,
      shares: 0,
      views: 0
    },
    location: { 
      name: 'Delhi, India',
      coordinates: {
        type: 'Point',
        coordinates: [77.2090, 28.6139] as [number, number]
      }
    },
    tags: [],
    customization: {
      product: {
        name: 'Premium Product',
        price: '1299',
        currency: 'INR',
        inStock: true,
        link: '#'
      }
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left sidebar with ProductServiceDetails */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <ProductServiceDetails 
          post={mockPost} 
          onClose={() => {}} 
          isSidebar={true}
        />
      </div>
      
      {/* Right side with reels */}
      <div className="flex-1 pt-3">
        <ReelsComponent />
      </div>
    </div>
  )
}

export default page
