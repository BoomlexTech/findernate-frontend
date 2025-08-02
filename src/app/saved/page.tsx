'use client'

import React, { useState, useEffect } from 'react'
import PostCard from '@/components/PostCard'
import { FeedPost, SavedPostsResponse } from '@/types'
import { getSavedPost } from '@/api/post'
import { Bookmark, RefreshCw } from 'lucide-react'

const SavedPage = () => {
  const [savedPosts, setSavedPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSavedPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response: SavedPostsResponse = await getSavedPost()
      
      // Extract and map the posts similar to MainContent.tsx
      const posts: FeedPost[] = response.data.savedPosts
        .filter(savedPost => savedPost.postId !== null)
        .map(savedPost => {
          const post = savedPost.postId as any // Raw post data from API
          
          // Calculate actual comment count from comments array (same logic as MainContent)
          let actualCommentCount = 0;
          if (post.comments && Array.isArray(post.comments)) {
            actualCommentCount = post.comments.reduce((total: number, comment: any) => {
              const repliesCount = comment.replies ? comment.replies.length : 0;
              return total + 1 + repliesCount;
            }, 0);
          }
          
          // Map to FeedPost structure that PostCard expects
          return {
            _id: post._id,
            userId: post.userId,
            username: post.userId?.username || '',
            profileImageUrl: post.userId?.profileImageUrl || '',
            description: post.description || '',
            caption: post.caption || '',
            contentType: post.contentType,
            postType: post.postType,
            createdAt: post.createdAt,
            media: post.media || [],
            isLikedBy: post.isLikedBy || false,
            likedBy: post.likedBy || [],
            engagement: {
              comments: actualCommentCount,
              impressions: post.engagement?.impressions || 0,
              likes: post.engagement?.likes || 0,
              reach: post.engagement?.reach || 0,
              saves: post.engagement?.saves || 0,
              shares: post.engagement?.shares || 0,
              views: post.engagement?.views || 0,
            },
            location: post.customization?.normal?.location || post.location || null,
            tags: post.customization?.normal?.tags || post.tags || [],
            customization: post.customization
          } as FeedPost
        })
      
      setSavedPosts(posts)
    } catch (err) {
      setError('Failed to load saved posts')
      console.error('Error fetching saved posts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSavedPosts()
  }, [])

  const handleRefresh = () => {
    fetchSavedPosts()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your saved posts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-yellow-500 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bookmark className="w-7 h-7 text-yellow-500" />
              <h1 className="text-2xl font-bold text-gray-800">Saved Posts</h1>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            {savedPosts.length} saved post{savedPosts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Posts */}
        {savedPosts.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved posts yet</h3>
            <p className="text-gray-500">
              Posts you save will appear here. Start exploring and save posts that inspire you!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {savedPosts.map((post) => (
              <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SavedPage
