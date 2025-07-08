'use client'
import AccountSettings from '@/components/AccountSettings';
import PostCard from '@/components/PostCard';
import ProfilePostsSection from '@/components/ProfilePostsSection';
import UserProfile from '@/components/UserProfile'
import Image from 'next/image'
import React from 'react'

const Page = () => {

  const posts = [
    {
      id: 1,
      user: {
        profilePic: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
        fullName: "Priya Sharma",
        username: "@priya_enterprises",
        isBusinessAccount: true,
        businessCategory: "Business"
      },
      timePosted: "8h ago",
      description: "Introducing our latest collection of handcrafted ethnic wear! Perfect for the wedding season 👌",
      productWindow: {
        heading: "Handcrafted Silk Saree",
        text: "Pure silk saree with intricate embroidery work. Perfect for weddings and special occasions.",
        price: "₹8,500"
      },
      image: "https://example.com/saree-image.jpg",
      location: "Mumbai, India",
      hashtags: ["#HandcraftedSaree", "#WeddingWear", "#EthnicFashion"],
      likes: 125,
      comments: 23,
      shares: 8
    },
    // Add more posts with the same structure...
  ];

  const savedPosts = [
    // Same structure as posts
  ];

  const taggedPosts = [
    // Same structure as posts
  ];
    const user = {
    name: "John Doe",
    profilePic: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png", // or a remote image if configured
    isBusinessAccount: true,
    businessCategory: "Business Account",
  };
  return (
    <div className='bg-gray-50 max-w-6xl mx-auto'>

            {/* Search Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-center mb-6">
              {/* Left Text */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Profile</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Discover businesses, products, services, and more
                </p>
              </div>
      
              {/* Right Profile Info */}
              <div className="flex items-center space-x-3">
                
                <div className="flex flex-col items-end">
                  <span className="font-medium text-gray-900">{user.name}</span>
                  {user.isBusinessAccount && (
                    <span
                      className="text-gray-400 text-xs">
                      {"Business Account"}
                    </span>
                  )}
                </div>
                <Image
                  src={user.profilePic}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>    
            </div>

            {/* Components in column with gaps */}
            <div className='flex flex-col gap-6'>
              <UserProfile/>
              <AccountSettings/>
              <div className='w-1/2'>
              <ProfilePostsSection
              PostCard={PostCard}
              posts={posts}  
              />
              </div>
            </div>
    </div>
  )
}

export default Page