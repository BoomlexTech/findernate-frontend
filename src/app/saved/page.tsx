'use client'

import React, { useState, useEffect } from 'react'
import PostCard from '@/components/PostCard'
import { FeedPost } from '@/types'
import { Bookmark, RefreshCw } from 'lucide-react'

const SavedPage = () => {
  const [savedPosts, setSavedPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // TODO: Replace with actual API call to fetch saved posts
  const fetchSavedPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Mock data - replace with actual API call
      const mockSavedPosts: FeedPost[] = [
        {
          _id: 'saved_1',
          userId: {
            _id: 'user_1',
            username: 'johndoe',
            profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
          },
          username: 'johndoe',
          profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
          description: 'Beautiful sunset at the beach! Perfect end to a wonderful day.',
          caption: 'Golden hour vibes ✨',
          contentType: 'normal',
          postType: 'photo',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          media: [
            {
              url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
              type: 'image',
            }
          ],
          isLikedBy: true,
          likedBy: ['current_user'],
          engagement: {
            comments: 12,
            impressions: 245,
            likes: 89,
            reach: 180,
            saves: 23,
            shares: 5,
            views: 234
          },
          location: {
            name: 'Malibu Beach, CA',
            coordinates: {
              type: 'Point',
              coordinates: [-118.6919, 34.0259]
            }
          },
          tags: ['#sunset', '#beach', '#photography', '#nature']
        },
        {
          _id: 'saved_2',
          userId: {
            _id: 'user_2',
            username: 'foodielover',
            profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
          },
          username: 'foodielover',
          profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
          description: 'Homemade pasta with fresh herbs from my garden. Cooking is my passion!',
          caption: 'Fresh pasta Sunday 🍝',
          contentType: 'normal',
          postType: 'photo',
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          media: [
            {
              url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=600&fit=crop',
              type: 'image',
            }
          ],
          isLikedBy: false,
          likedBy: [],
          engagement: {
            comments: 8,
            impressions: 156,
            likes: 45,
            reach: 120,
            saves: 15,
            shares: 3,
            views: 145
          },
          location: {
            name: 'Home Kitchen',
            coordinates: {
              type: 'Point',
              coordinates: [-74.0060, 40.7128]
            }
          },
          tags: ['#cooking', '#pasta', '#homemade', '#food']
        }
      ]
      
      setSavedPosts(mockSavedPosts)
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
          <p className="text-red-500 mb-4">{error}</p>
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
