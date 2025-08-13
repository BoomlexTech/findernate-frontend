'use client';

import { useState, useEffect, useRef } from 'react';
import AddComment from './AddComment';
import { MessageCircle } from 'lucide-react';
import CommentItem from './CommentItem';
import { Comment, getCommentsByPost } from '@/api/comment';

interface ReelCommentsSectionProps {
  postId: string;
  initialCommentCount?: number;
  onCommentCountChange?: (count: number) => void;
  maxVisible?: number;
}

const ReelCommentsSection = ({ postId, initialCommentCount = 0, onCommentCountChange, maxVisible = 4 }: ReelCommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCommentCount, setTotalCommentCount] = useState(initialCommentCount);

  const handleNewComment = (newComment: Comment) => {
    // Ensure user info is present for new comment
    let commentWithUser = newComment;
    if (!newComment.user && typeof newComment.userId === 'object' && newComment.userId !== null) {
      commentWithUser = { ...newComment, user: newComment.userId };
    }
    setComments((prev) => [commentWithUser, ...prev].slice(0, maxVisible));
    setTotalCommentCount((prev) => prev + 1);
  };

  const handleReplyAdded = (reply: Comment) => {
    // Ensure user info is present for reply
    let replyWithUser = reply;
    if (!reply.user && typeof reply.userId === 'object' && reply.userId !== null) {
      replyWithUser = { ...reply, user: reply.userId };
    }

    // Add reply to the parent comment's replies array
    setComments((prev) => 
      prev.map((comment) => {
        if (comment._id === reply.parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), replyWithUser]
          };
        }
        return comment;
      })
    );
    setTotalCommentCount((prev) => prev + 1);
  };

  useEffect(() => {
    setLoading(true);
    getCommentsByPost(postId, 1, maxVisible)
      .then((data) => {
        // Ensure user info is always present for each comment
        const commentsWithUser = Array.isArray(data.comments)
          ? data.comments.map((c: Comment) => {
              if (c.user) return c;
              if (typeof c.userId === 'object' && c.userId !== null) {
                return { ...c, user: c.userId };
              }
              return c;
            })
          : [];
        setComments(commentsWithUser);
        setTotalCommentCount(data.totalComments || 0);
        setLoading(false);
      })
      .catch(() => {
        setComments([]);
        setLoading(false);
      });
  }, [postId, maxVisible]);

  useEffect(() => {
    if (typeof onCommentCountChange === 'function') {
      onCommentCountChange(totalCommentCount);
    }
  }, [totalCommentCount]);

  return (
    <div className="space-y-4 p-3">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle className="w-5 h-5 text-gray-600" />
        <h3 className="text-base font-semibold text-gray-900">Comments ({totalCommentCount})</h3>
      </div>
      {/* Comment input box (matches AddComment style) */}
      <div className="mb-3">
        <AddComment postId={postId} onCommentAdded={handleNewComment} />
      </div>
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading comments...</p>
        </div>
      ) : (comments.length === 0) ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-500 mb-2">No comments yet</h4>
          <p className="text-gray-400">Be the first to comment on this post!</p>
        </div>
      ) : (
        <>
          {comments.slice(0, maxVisible).map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onUpdate={() => {}}
              onDelete={() => {}}
              onReplyAdded={handleReplyAdded}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default ReelCommentsSection;