'use client';

import { useState, memo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, MoreHorizontal, Edit, Trash2, Flag } from 'lucide-react';
import { Button } from './ui/button';
import { Comment, likeComment, unlikeComment, updateComment, deleteComment } from '@/api/comment';
import { useUserStore } from '@/store/useUserStore';
import formatPostDate from '@/utils/formatDate';
import ReportModal from './ReportModal';
import AddComment from './AddComment';
import { emitCommentLikeNotification } from '@/hooks/useCommentNotifications';

interface CommentItemProps {
  comment: Comment;
  onUpdate: (updatedComment: Comment) => void;
  onDelete: (commentId: string) => void;
  onReplyAdded?: (reply: Comment) => void;
  isReply?: boolean;
  parentCommentId?: string; // For nested replies - track the root comment ID
}

const CommentItem = memo(({ comment, onUpdate, onDelete, onReplyAdded, isReply = false, parentCommentId }: CommentItemProps) => {
  const { user } = useUserStore();
  const router = useRouter();

  // Use the new backend field: isLikedBy
  const [isLiked, setIsLiked] = useState(comment.isLikedBy || false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showOptions, setShowOptions] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replies, setReplies] = useState<Comment[]>(comment.replies || []);
  const [showReplies, setShowReplies] = useState(false);

  const isOwnComment = user?._id === comment.userId;
  const canLikeComment = !isOwnComment; // Disable like for own comments

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileClick = () => {
    if (comment.user?.username) {
      // Check if this is the current user's own comment
      if (user?._id === comment.userId) {
        router.push('/profile');
      } else {
        router.push(`/userprofile/${comment.user.username}`);
      }
    }
  };

  const handleLikeToggle = async () => {
    if (isLikeLoading) return;

    setIsLikeLoading(true);
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    // Optimistic update
    const shouldLike = !isLiked;
    setIsLiked(shouldLike);
    setLikesCount(shouldLike ? likesCount + 1 : likesCount - 1);

    try {
      if (shouldLike) {
        try {
          const response = await likeComment(comment._id);

          // Update with response data from backend
          if (response.data) {
            const { likedBy, isLikedBy } = response.data;

            // Update parent component with new like status from backend
            onUpdate({
              ...comment,
              likes: likedBy,
              isLikedBy: isLikedBy,
              likesCount: likedBy.length
            });

            // Update local state with backend response
            setLikesCount(likedBy.length);
            setIsLiked(isLikedBy);
          }

          // Emit notification for comment like
          if (user?.username && comment.user?._id) {
            emitCommentLikeNotification({
              commentId: comment._id,
              likerUsername: user.username,
              commentOwnerId: comment.user._id
            });
          }
        } catch (likeError: any) {
          // Handle "already liked" error or self-like restriction
          if (likeError?.response?.status === 409) {
            //console.log(`Comment ${comment._id} already liked or self-like not allowed - treating as successful`);
            return; // Keep the optimistic update
          }
          throw likeError;
        }
      } else {
        try {
          const response = await unlikeComment(comment._id);

          // Update with response data from backend
          if (response.data) {
            const { likedBy, isLikedBy } = response.data;

            // Update parent component with new unlike status from backend
            onUpdate({
              ...comment,
              likes: likedBy,
              isLikedBy: isLikedBy,
              likesCount: likedBy.length
            });

            // Update local state with backend response
            setLikesCount(likedBy.length);
            setIsLiked(isLikedBy);
          }
        } catch (unlikeError: any) {
          // Handle "like not found" error
          if (unlikeError?.response?.status === 404 ||
              unlikeError?.response?.data?.message?.includes('not found')) {
            //console.log(`Like not found for comment ${comment._id} - treating as successful unlike`);
            return; // Keep the optimistic update
          }
          throw unlikeError;
        }
      }
    } catch (error: any) {
      // Revert optimistic update on unexpected errors
      console.error('Error toggling comment like:', error);
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);

      // Show user-friendly message for specific errors
      if (error?.response?.status === 409) {
        //console.log('Cannot like your own comment or comment already liked');
      }
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      const updatedComment = await updateComment(comment._id, editContent);
      onUpdate({ ...comment, content: editContent, isEdited: true });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(comment._id);
        onDelete(comment._id);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleReplyAdded = (reply: Comment) => {
    // Add reply to local state for immediate display
    setReplies(prev => [reply, ...prev]);
    setShowReplyBox(false);
    setShowReplies(true);
    // Also notify parent component if callback is provided
    onReplyAdded?.(reply);
  };

  const handleReplyUpdate = (updatedReply: Comment) => {
    setReplies(prev => 
      prev.map(reply => 
        reply._id === updatedReply._id ? updatedReply : reply
      )
    );
  };

  const handleReplyDelete = (replyId: string) => {
    setReplies(prev => prev.filter(reply => reply._id !== replyId));
  };

  return (
    <div 
      id={`comment-${comment._id}`}
      className={`flex gap-3 ${isReply ? 'ml-8 pt-3' : ''}`}
    >
      {/* Profile Image */}
      <div className="flex-shrink-0">
        <button 
          onClick={handleProfileClick}
          className="focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 rounded-full"
        >
          {comment.user?.profileImageUrl ? (
            <Image
              src={comment.user.profileImageUrl}
              alt={comment.user.username || 'User'}
              width={32}
              height={32}
              className="rounded-full object-cover hover:ring-2 hover:ring-yellow-400 transition-all cursor-pointer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-button-gradient flex items-center justify-center hover:ring-2 hover:ring-yellow-400 transition-all cursor-pointer">
              <span className="text-white text-shadow text-xs font-bold">
                {getInitials(comment.user?.fullName || comment.user?.username || 'U')}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Comment Content */}
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <button 
                onClick={handleProfileClick}
                className="font-semibold text-sm text-gray-900 hover:text-yellow-600 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 rounded"
              >
                {comment.user?.fullName || comment.user?.username || 'Unknown User'}
              </button>
              {comment.isEdited && (
                <span className="text-xs text-gray-500">(edited)</span>
              )}
            </div>

            {/* Options Menu */}
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>

              {showOptions && (
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[120px]">
                  {isOwnComment ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowOptions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          handleDelete();
                          setShowOptions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setShowReportModal(true);
                        setShowOptions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Flag className="w-3 h-3" />
                      Report
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Comment Text */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full text-sm text-gray-900 bg-white border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleEdit}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1"
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs px-3 py-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-800">
              {comment.replyToUserId && (
                <span className="text-gray-600 mr-1">
                  replying to <span className="font-semibold text-yellow-600">{comment.replyToUserId.username}</span>:
                </span>
              )}
              {comment.content}
            </div>
          )}
        </div>

        {/* Comment Actions */}
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <button
            onClick={handleLikeToggle}
            disabled={isLikeLoading || !canLikeComment}
            className={`flex items-center gap-1 transition-all ${
              canLikeComment ? 'hover:text-red-600 cursor-pointer' : 'cursor-not-allowed opacity-50'
            }`}
            title={!canLikeComment ? "You cannot like your own comment" : ""}
          >
            <Heart
              className={`w-4 h-4 transition-all ${
                isLiked ? 'fill-red-600 text-red-600' : 'text-gray-500'
              }`}
              fill={isLiked ? 'currentColor' : 'none'}
            />
            <span className={`${isLiked ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
              {likesCount}
            </span>
          </button>

          {!isReply && (
            <button 
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <MessageCircle className="w-3 h-3" />
              Reply
            </button>
          )}

          {replies.length > 0 && !isReply && (
            <button 
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 hover:text-blue-600"
            >
              {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}

          <span>{formatPostDate(comment.createdAt)}</span>
        </div>

        {/* Reply Box */}
        {showReplyBox && !isReply && (
          <div className="mt-3">
            <AddComment
              postId={comment.postId}
              parentCommentId={comment._id}
              originalCommenterUserId={comment.user?._id}
              onCommentAdded={handleReplyAdded}
              placeholder={`Reply to ${comment.user?.fullName || comment.user?.username || 'this comment'}...`}
              shouldFocus={true}
            />
          </div>
        )}

        {/* Replies */}
        {showReplies && replies.length > 0 && !isReply && (
          <div className="mt-3 space-y-3">
            {replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                onUpdate={handleReplyUpdate}
                onDelete={handleReplyDelete}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="comment"
        contentId={comment._id}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if comment data has actually changed
  return prevProps.comment._id === nextProps.comment._id &&
         prevProps.comment.content === nextProps.comment.content &&
         prevProps.comment.likesCount === nextProps.comment.likesCount &&
         prevProps.comment.isLikedBy === nextProps.comment.isLikedBy &&
         prevProps.comment.replies?.length === nextProps.comment.replies?.length &&
         prevProps.isReply === nextProps.isReply;
});

CommentItem.displayName = 'CommentItem';

export default CommentItem;