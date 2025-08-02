'use client'

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { FeedPost } from '@/types';
import PostCard from '@/components/PostCard';
import CommentsSection from '@/components/CommentsSection';
import ProductServiceDetails from '@/components/ProductServiceDetails';
import { getPostById } from '@/api/post';
import { getUserById } from '@/api/user';

const PostPage = () => {
  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [showProductServiceDetails, setShowProductServiceDetails] = useState(false);
  const params = useParams();
  const searchParams = useSearchParams();
  const postId = params.postId as string;
  const shouldFocusComment = searchParams.get('focus') === 'comment';

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
    const loadPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch post data from API using post ID
        const postData = await getPostById(postId);
        console.log('Post data loaded:', postData);
        
        // Fetch user details if userId is available
        if (postData.userId) {
          try {
            console.log('Fetching user with ID:', postData.userId);
            const userData = await getUserById(postData.userId);
            console.log('User data received:', userData);
            console.log('Available user fields:', Object.keys(userData));
            console.log('userData.userId:', userData.userId);
            console.log('userData.userId.username:', userData.userId?.username);
            console.log('userData.userId.fullName:', userData.userId?.fullName);
            
            // Add username and profile image to post data
            postData.username = userData.userId?.username || userData.userId?.fullName || 'User';
            postData.profileImageUrl = userData.userId?.profileImageUrl || '';
            
            console.log('Final username set to:', postData.username);
          } catch (userError: any) {
            console.error('Failed to fetch user data:', userError);
            postData.username = 'Unknown User';
          }
        } else {
          console.log('No userId found in post data');
          postData.username = 'No User ID';
        }
        
        setPost(postData);
        setCommentCount(postData.engagement?.comments || 0);
        
      } catch (error) {
        console.error('Error loading post:', error);
        setError('Failed to load post. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadPost();
    }
  }, [postId]);

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
        <div className="text-center text-yellow-500">
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
          
          {/* Product/Service Details Button
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
          )} */}
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-sm">
          <CommentsSection 
            postId={postId} 
            onCommentCountChange={handleCommentCountChange}
            initialCommentCount={post.engagement?.comments || 0}
            shouldFocusComment={shouldFocusComment}
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