'use client';

import { Heart, MessageCircle, Share2, MapPin } from 'lucide-react'; //Phone
import Image from 'next/image';
import Link from 'next/link';
import { FeedPost } from '@/types';
// import { Button } from './ui/button';
import formatPostDate from '@/utils/formatDate';
import { useState } from 'react';
import ServiceCard from './post-window/ServiceCard';
import { Badge } from './ui/badge';
import ProductCard from './post-window/ProductCard';
import BusinessPostCard from './post-window/BusinessCard';

export interface PostCardProps {
  post: FeedPost;
}

export default function PostCard({ post }: PostCardProps) {
  const [profileImageError, setProfileImageError] = useState(false);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 relative">
      {/* Media + Info Side-by-Side */}
      <div className="flex flex-row gap-4 p-3">
        {/* Media */}
        {post.media[0]?.type === 'video' ? (
          <div className="w-[21rem] h-[21rem] overflow-hidden rounded-xl">
            <video
              controls
              className="w-full h-full object-cover rounded-xl"
              poster={post.media[0]?.thumbnailUrl}
            >
              <source src={post.media[0]?.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div className="relative w-[21rem] h-[24rem] overflow-hidden rounded-2xl">
            <Image
              src={post.media[0]?.url}
              alt="Post content"
              layout="fill"
              objectFit="cover"
              className="rounded-xl"
              unoptimized
            />
          </div>
        )}

        {/* Profile + Info */}
        <div className="flex flex-col justify-start flex-1 space-y-3 relative">
          <div className="flex items-start gap-3">
            <Link href={`/profile/${post.username}`}>
              <Image
                width={40}
                height={40}
                src={
                  profileImageError || !post.profileImageUrl
                    ? '/placeholderimg.png'
                    : post.profileImageUrl
                }
                alt={post.username || 'User Profile Image'}
                className="w-10 h-10 rounded-full object-cover"
                onError={() => setProfileImageError(true)}
              />
            </Link>
            <div>
                <div className='flex gap-2'>
              <h3 className="font-semibold text-gray-900">{post.username}</h3>
              {post.contentType && <Badge className='bg-button-gradient' variant='outline'>{post.contentType}</Badge>}
                </div>
            {post.location && (
            <div className="flex items-center gap-1 text-gray-700">
              <MapPin className="w-3 h-3 text-yellow-500" />
              <p className="text-xs">{post.location.name}</p>
            </div>
              )}
            </div>
          </div>

          <p className="text-gray-900 leading-relaxed">{post.caption}</p>

          {post.contentType === 'service' && <ServiceCard />}
          {post.contentType === 'product' && <ProductCard />}
          {post.contentType === 'business' && <BusinessPostCard />}

          

        {/* Hashtags (Empty for now) */}
      <div className="px-1 pb-4">
        <div className="flex flex-wrap gap-2"><p className='text-black'>{post?.tags || "test tags, tag, nike"}</p></div>
      </div>

          <div className="px-2 py-1 absolute bottom-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">{post.engagement.likes || 0}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.engagement.comments || 0}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">{post.engagement.shares || 0}</span>
            </button>
          </div>
        </div>
      </div>

        </div>



      <div className="absolute bottom-2 right-2 text-xs text-gray-500">
      <p className="text-xs text-gray-700 p-2">{formatPostDate(post.createdAt)}</p>
      </div>

    </div>
    </div>
  );
}
