'use client'
import { getPostsByUserid } from '@/api/homeFeed';
import AccountSettings from '@/components/AccountSettings';
import FloatingHeader from '@/components/FloatingHeader';
import PostCard from '@/components/PostCard';
import ProfilePostsSection from '@/components/ProfilePostsSection';
import UserProfile from '@/components/UserProfile'
import { useUserStore } from '@/store/useUserStore';
import { FeedPost } from '@/types';
import React, { useEffect, useState } from 'react'

const Page = () => {

const [posts, setPosts] = useState<FeedPost[]>([])
const {user} = useUserStore();

useEffect(() => {
  const fetchPosts = async () => {
    if (!user?._id) return;
    const response = await getPostsByUserid(user?._id || '')
    console.log(response)
    setPosts(response.data.posts)
  }
  fetchPosts()
}, [user?._id])

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