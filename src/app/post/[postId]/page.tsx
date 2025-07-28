'use client'

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { FeedPost } from '@/types';
import PostCard from '@/components/PostCard';
import CommentsSection from '@/components/CommentsSection';
import ProductServiceDetails from '@/components/ProductServiceDetails';

const PostPage = () => {
  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [showProductServiceDetails, setShowProductServiceDetails] = useState(false);
  const params = useParams();
  const searchParams = useSearchParams();
  const postId = params.postId as string;

  const handleCommentCountChange = useCallback((newCount: number) => {
    setCommentCount(newCount);
    // Update the post object as well to keep it in sync
    setPost(prev => {
      if (prev) {
        return {
          ...prev,
          engagement: {
            ...prev.engagement,
            comments: newCount
          }
        };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    const loadPost = () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get post data from URL params
        const postData = searchParams.get('data');
        if (postData) {
          const decodedPost = JSON.parse(decodeURIComponent(postData));
          setPost(decodedPost);
          setCommentCount(decodedPost.engagement?.comments || 0);
        } else {
          setError('Post data not found. Please go back and click on the post again.');
        }
        
      } catch (error) {
        console.error('Error loading post:', error);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadPost();
    }
  }, [postId, searchParams]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">{error || 'Post not found'}</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Post Content */}
        <div className="mb-6">
          <PostCard post={post} />
          
          {/* Product/Service Details Button */}
          {(post.contentType === 'product' || post.contentType === 'service') && (
            <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
              <button
                onClick={() => setShowProductServiceDetails(true)}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-[1.02] shadow-md hover:shadow-lg ${
                  post.contentType === 'product'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                }`}
              >
                {post.contentType === 'product' ? '🛍️ View Product Details' : '🔧 View Service Details'}
              </button>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-sm">
          <CommentsSection 
            postId={postId} 
            onCommentCountChange={handleCommentCountChange}
          />
        </div>
      </div>

      {/* Product/Service Details Modal */}
      {showProductServiceDetails && post && (
        <ProductServiceDetails 
          post={post}
          onClose={() => setShowProductServiceDetails(false)}
        />
      )}
    </div>
  );
};

export default PostPage;