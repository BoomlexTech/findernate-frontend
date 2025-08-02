'use client';

import ProductServiceDetails from '@/components/ProductServiceDetails'
import ReelsComponent from '@/components/ReelsComp'
import React from 'react'

const page = () => {
  // Mock post data - replace with actual data from reels API
  const mockPost = {
    id: '1',
    caption: 'Featured Product/Service',
    contentType: 'product' as const,
    location: { name: 'Delhi, India' },
    customization: {
      product: {
        name: 'Premium Product'
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
