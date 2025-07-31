'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Heart, ChevronDown, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import CommentItem from './CommentItem';
import AddComment from './AddComment';
import { Comment, getCommentsByPost } from '@/api/comment';
import { postEvents } from '@/utils/postEvents';

interface CommentsSectionProps {
  postId: string;
  onCommentCountChange?: (count: number) => void;
  initialCommentCount?: number;
  shouldFocusComment?: boolean;
}

type SortOption = 'latest' | 'likes';

const CommentsSection = ({ postId, onCommentCountChange, initialCommentCount = 0, shouldFocusComment = false }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [totalCommentCount, setTotalCommentCount] = useState(initialCommentCount);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [commentsPerPage] = useState(10);
  const [paginationLoading, setPaginationLoading] = useState(false);
  
  // Store user-created comments that should persist across refreshes
  const userCommentsRef = useRef<{ [commentId: string]: Comment }>({});

  useEffect(() => {
    fetchComments();
  }, [postId, currentPage]);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowSortOptions(false);
      }
    };

    if (showSortOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSortOptions]);

  // Update comment count whenever total changes (not just current page)
  useEffect(() => {
    if (totalCommentCount !== initialCommentCount) {
      onCommentCountChange?.(totalCommentCount);
      // Emit event for cross-tab/component communication
      postEvents.emit(postId, 'commentCountChange', totalCommentCount);
    }
  }, [totalCommentCount, postId]); // Removed onCommentCountChange from deps to prevent infinite loop

  const fetchComments = async (page: number = currentPage) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setPaginationLoading(true);
      }
      
      console.log(`Fetching comments for post: ${postId}, page: ${page}`);
      const commentsData = await getCommentsByPost(postId, page, commentsPerPage);
      console.log('Comments data received:', commentsData);
      
      // Handle pagination response
      if (commentsData) {
        // Update pagination info
        setTotalCommentCount(commentsData.totalComments || 0);
        setCurrentPage(commentsData.page || 1);
        setTotalPages(commentsData.totalPages || 1);
        
        // Get comments array
        let rawComments: Comment[] = [];
        if (Array.isArray(commentsData.comments)) {
          rawComments = commentsData.comments;
        } else if (Array.isArray(commentsData)) {
          rawComments = commentsData;
        }
      
      // Process comments and extract user data properly 
      const processedComments = rawComments.map((comment) => {
        // Check if we already have user data for this comment in cache
        const cachedComment = userCommentsRef.current[comment._id];
        if (cachedComment && cachedComment.user) {
          return { ...comment, user: cachedComment.user };
        }
        
        // Extract user data from the userId field (which can be string or user object)
        const userData = comment.userId;
        if (userData && typeof userData === 'object' && '_id' in userData && userData._id) {
          return {
            ...comment,
            userId: userData._id, // Convert userId back to string for compatibility
            user: {
              _id: userData._id,
              username: userData.username || 'User',
              fullName: userData.fullName || userData.username || 'User',
              profileImageUrl: userData.profileImageUrl || ''
            }
          };
        }
        
        // Fallback for comments without proper user data
        return {
          ...comment,
          user: {
            _id: typeof comment.userId === 'string' ? comment.userId : '',
            username: 'User',
            fullName: 'User',
            profileImageUrl: ''
          }
        };
        });
        
        setComments(processedComments);
      } else {
        setComments([]);
        setTotalCommentCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      // If we can't fetch comments, start with empty array but don't fail
      setComments([]);
      setTotalCommentCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  const handleNewComment = (newComment: Comment) => {
    // Store this comment with full user data in our ref
    userCommentsRef.current[newComment._id] = newComment;
    
    // Add to current page if we're on page 1, otherwise refetch
    if (currentPage === 1) {
      setComments(prev => [newComment, ...prev]);
      setTotalCommentCount(prev => prev + 1);
    } else {
      // Go to first page to see the new comment
      setCurrentPage(1);
      fetchComments(1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      fetchComments(newPage);
    }
  };

  const handleCommentUpdate = (updatedComment: Comment) => {
    setComments(prev => 
      prev.map(comment => 
        comment._id === updatedComment._id ? updatedComment : comment
      )
    );
  };

  const handleCommentDelete = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment._id !== commentId));
    setTotalCommentCount(prev => Math.max(0, prev - 1));
  };

  const sortedComments = Array.isArray(comments) ? [...comments].sort((a, b) => {
    if (sortBy === 'likes') {
      const aLikes = a.likesCount || a.likes?.length || 0;
      const bLikes = b.likesCount || b.likes?.length || 0;
      console.log(`Sorting by likes: Comment ${a._id} has ${aLikes} likes, Comment ${b._id} has ${bLikes} likes`);
      return bLikes - aLikes;
    } else {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      console.log(`Sorting by latest: Comment ${a._id} created at ${a.createdAt}, Comment ${b._id} created at ${b.createdAt}`);
      return bTime - aTime;
    }
  }) : [];

  console.log(`CommentsSection: Sorting ${comments.length} comments by ${sortBy}, result: ${sortedComments.length} sorted comments`);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Comments ({totalCommentCount})
          </h3>
        </div>

        {/* Sort Options */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Toggle sort options, current:', showSortOptions);
              setShowSortOptions(!showSortOptions);
            }}
            className="flex items-center gap-2 text-sm"
          >
            <Filter className="w-4 h-4" />
            Sort by {sortBy === 'latest' ? 'Latest' : 'Most Liked'}
            <ChevronDown className={`w-4 h-4 transition-transform ${showSortOptions ? 'rotate-180' : ''}`} />
          </Button>

          {showSortOptions && (
            <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg z-50 min-w-[150px]">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Sorting by latest');
                  setSortBy('latest');
                  setShowSortOptions(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                  sortBy === 'latest' ? 'bg-yellow-50 text-yellow-700 font-medium' : 'text-gray-700'
                }`}
              >
                Latest
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Sorting by likes');
                  setSortBy('likes');
                  setShowSortOptions(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                  sortBy === 'likes' ? 'bg-yellow-50 text-yellow-700 font-medium' : 'text-gray-700'
                }`}
              >
                Most Liked
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Comment */}
      <div className="mb-6">
        <AddComment 
          postId={postId} 
          onCommentAdded={handleNewComment}
          shouldFocus={shouldFocusComment}
        />
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading comments...</p>
          </div>
        ) : (sortedComments?.length || 0) === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-500 mb-2">No comments yet</h4>
            <p className="text-gray-400">Be the first to comment on this post!</p>
          </div>
        ) : (
          <>
            {sortedComments?.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onUpdate={handleCommentUpdate}
                onDelete={handleCommentDelete}
              />
            ))}
            
            {paginationLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-500 mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Loading more comments...</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages} • {totalCommentCount} total comments
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || paginationLoading}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {/* Show page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={paginationLoading}
                    className={`w-8 h-8 p-0 ${
                      currentPage === pageNum 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || paginationLoading}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;