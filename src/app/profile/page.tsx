'use client'
import AccountSettings from '@/components/AccountSettings';
import FloatingHeader from '@/components/FloatingHeader';
import PostCard from '@/components/PostCard';
import ProfilePostsSection from '@/components/ProfilePostsSection';
import UserProfile from '@/components/UserProfile'
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

  // const savedPosts = [
  //    Same structure as posts
  // ];

  // const taggedPosts = [
  //    Same structure as posts
  // ];

  return (
    <div className='bg-gray-50 max-w-6xl mx-auto'>

            <FloatingHeader
            paragraph="Manage your account and business settings"
            heading="Profile"
            username="John Doe"
            accountBadge={true}/>

            {/* Components in column with gaps */}
            <div className='flex flex-col gap-6'>
              <UserProfile/>
              <AccountSettings/>
              <div className='w-full'>
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