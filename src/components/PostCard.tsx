"use client";

import { Heart, MessageCircle, Share2, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface PostCardProps {
  post: {
    id: number;
    user: {
      profilePic: string;
      fullName: string;
      username: string;
      isBusinessAccount: boolean;
      businessCategory?: string;
    };
    timePosted: string;
    description: string;
    productWindow?: {
      heading: string;
      text: string;
      price: string;
    };
    image: string;
    location: string;
    hashtags: string[];
    likes: number;
    comments: number;
    shares: number;
  };
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start space-x-3">
          {/* Removed Avatar */}
          <Image
          width={20}
          height={20}
          src={post.user.profilePic}
          alt={post.user.fullName}
          className="w-10 h-10 rounded-full object-cover"
           />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{post.user.fullName}</h3>
              {post.user.isBusinessAccount && (
                <Badge variant="secondary" className="bg-yellow-50 text-yellow-600 text-xs">
                  {post.user.businessCategory}
                </Badge>
              )}
            <p className="text-xs text-gray-500 mt-1 ml-auto">{post.timePosted}</p>
            </div>

            <p className="text-sm text-gray-600">{post.user.username}</p> 
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 pb-4">
        <p className="text-gray-900 leading-relaxed">{post.description}</p>
      </div>

      {/* Product Window */}
      {post.productWindow && (
        <div className="mx-6 mb-4 p-4 bg-yellow-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">{post.productWindow.heading}</h4>
              <p className="text-sm text-gray-600 mb-2">{post.productWindow.text}</p>
              <p className="text-lg font-bold text-yellow-600">{post.productWindow.price}</p>
            </div>
            <Button  variant='custom' className="ml-4 bg-[#DBB42C] hover:bg-[#DBB42C]/90 text-white font-medium cursor-pointer">
              Learn More
            </Button>
          </div>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square w-full">
        <Image
          width={64}
          height={64}
          src={"https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"}
          alt="Post content"
          className="w-full object-cover"
          unoptimized
        />
      </div>

      {/* Location */}
      <div className="px-6 py-3 flex items-center space-x-2 text-sm text-gray-600">
        <MapPin className="w-4 h-4" />
        <span>{post.location}</span>
      </div>

      {/* Hashtags */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-2">
          {post.hashtags.map((tag, index) => (
            <button
              key={index}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100"></div>

      {/* Actions */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">{post.likes}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">{post.shares}</span>
            </button>
          </div>

          {post.user.isBusinessAccount && (
            <Button
              variant="custom"
              size="sm"
              className="flex items-center space-x-2 text-yellow-800 hover:bg-[#FCD45C] cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Contact Business</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
