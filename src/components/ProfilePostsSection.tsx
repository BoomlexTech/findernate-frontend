'use client'
import React, { useState } from 'react';
import { Grid3X3, Bookmark, Tag } from 'lucide-react';
import { Post } from './PostCard';



interface ProfilePostsSectionProps {
  PostCard: React.ComponentType<{post: Post}>
  posts?: Post[];
  savedPosts?: Post[];
  taggedPosts?: Post[];
}

const ProfilePostsSection: React.FC<ProfilePostsSectionProps> = ({ 
  PostCard, 
  posts = [], 
  savedPosts = [], 
  taggedPosts = [] 
}) => {
  const [activeTab, setActiveTab] = useState('posts');

  const tabs = [
    { id: 'posts', label: 'Posts', icon: Grid3X3, count: posts.length },
    { id: 'saved', label: 'Saved', icon: Bookmark, count: savedPosts.length },
    { id: 'tagged', label: 'Tagged', icon: Tag, count: taggedPosts.length }
  ];

  const getCurrentPosts = () => {
    switch (activeTab) {
      case 'posts':
        return posts;
      case 'saved':
        return savedPosts;
      case 'tagged':
        return taggedPosts;
      default:
        return posts;
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 text-xs ${
                  activeTab === tab.id ? 'text-orange-600' : 'text-gray-400'
                }`}>
                  ({tab.count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="p-6">
        {getCurrentPosts().length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {activeTab === 'posts' && <Grid3X3 className="w-12 h-12 mx-auto" />}
              {activeTab === 'saved' && <Bookmark className="w-12 h-12 mx-auto" />}
              {activeTab === 'tagged' && <Tag className="w-12 h-12 mx-auto" />}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} yet
            </h3>
            <p className="text-gray-500">
              {activeTab === 'posts' && "Share your first post to get started"}
              {activeTab === 'saved' && "Save posts you want to view later"}
              {activeTab === 'tagged' && "Posts you're tagged in will appear here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {getCurrentPosts().map((post, index) => (
              <PostCard key={post.id || index} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePostsSection;