'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Send } from 'lucide-react';
import { Button } from './ui/button';
import { Comment, createComment } from '@/api/comment';
import { useUserStore } from '@/store/useUserStore';
import { emitCommentNotification, emitCommentReplyNotification } from '@/hooks/useCommentNotifications';

interface AddCommentProps {
  postId: string;
  postOwnerId?: string;
  parentCommentId?: string;
  originalCommenterUserId?: string; // For reply notifications and replyToUserId
  originalCommenterUsername?: string; // Fallback username for display
  onCommentAdded: (comment: Comment) => void;
  placeholder?: string;
  shouldFocus?: boolean;
}

const AddComment = ({
  postId,
  postOwnerId,
  parentCommentId,
  originalCommenterUserId,
  originalCommenterUsername,
  onCommentAdded,
  placeholder = "Add a comment...",
  shouldFocus = false
}: AddCommentProps) => {
  const { user } = useUserStore();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when shouldFocus is true
  useEffect(() => {
    if (shouldFocus && inputRef.current) {
      // Use setTimeout to ensure the component is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [shouldFocus]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const commentData = {
        postId,
        content: content.trim(),
        ...(parentCommentId && { parentCommentId }),
        ...(originalCommenterUserId && { replyToUserId: originalCommenterUserId })
      };

      const newComment = await createComment(commentData);

      console.log('[AddComment] Backend response:', newComment);
      console.log('[AddComment] replyToUserId from backend:', newComment.replyToUserId);

      // Add user info to the comment for immediate display
      // Backend returns: { _id, postId, userId (string), content, parentCommentId, replyToUserId, likes: [], isEdited, isDeleted, createdAt, updatedAt, __v }
      // We need to transform it to match our Comment type with user data populated
      const commentWithUser: Comment = {
        ...newComment,
        userId: user?._id || newComment.userId || '',
        user: {
          _id: user?._id || '',
          username: user?.username || '',
          fullName: user?.fullName || '',
          profileImageUrl: user?.profileImageUrl || ''
        },
        // Preserve replyToUserId from backend, or create fallback
        replyToUserId: newComment.replyToUserId || (originalCommenterUserId && originalCommenterUsername ? {
          _id: originalCommenterUserId,
          username: originalCommenterUsername,
          fullName: originalCommenterUsername,
          profileImageUrl: ''
        } : undefined),
        likes: newComment.likes || [],
        likesCount: Array.isArray(newComment.likes) ? newComment.likes.length : 0,
        isLikedBy: false,
        replies: [] // New comments have no replies initially
      };

      console.log('[AddComment] Final comment with user:', commentWithUser);
      console.log('[AddComment] Final replyToUserId:', commentWithUser.replyToUserId);

      onCommentAdded(commentWithUser);
      setContent('');
      
      // Emit appropriate notification based on comment type
      if (user?.username) {
        if (parentCommentId && originalCommenterUserId) {
          // This is a reply - emit reply notification
          emitCommentReplyNotification({
            parentCommentId,
            replyId: newComment._id,
            replierUsername: user.username,
            originalCommenterUserId,
            replyContent: content.trim()
          });
        } else if (postOwnerId) {
          // This is a regular comment - emit comment notification
          emitCommentNotification({
            postId,
            commentId: newComment._id,
            commenterUsername: user.username,
            postOwnerId,
            commentContent: content.trim()
          });
        }
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-500">Please log in to comment</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      {/* User Profile Image */}
      <div className="flex-shrink-0">
        {user.profileImageUrl ? (
          <Image
            src={user.profileImageUrl}
            alt={user.username || 'Your profile'}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-button-gradient flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {getInitials(user.fullName || user.username || 'You')}
            </span>
          </div>
        )}
      </div>

      {/* Comment Input */}
      <div className="flex-1 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          disabled={isSubmitting}
        />
        
        <Button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-full px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddComment;