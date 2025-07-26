'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Send } from 'lucide-react';
import { Button } from './ui/button';
import { Comment, createComment } from '@/api/comment';
import { useUserStore } from '@/store/useUserStore';

interface AddCommentProps {
  postId: string;
  parentCommentId?: string;
  onCommentAdded: (comment: Comment) => void;
  placeholder?: string;
}

const AddComment = ({ 
  postId, 
  parentCommentId, 
  onCommentAdded, 
  placeholder = "Add a comment..." 
}: AddCommentProps) => {
  const { user } = useUserStore();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        ...(parentCommentId && { parentCommentId })
      };

      const newComment = await createComment(commentData);
      
      // Add user info to the comment for immediate display
      const commentWithUser = {
        ...newComment,
        userId: user?._id || '',
        user: {
          _id: user?._id || '',
          username: user?.username || '',
          fullName: user?.fullName || '',
          profileImageUrl: user?.profileImageUrl || ''
        },
        likesCount: 0,
        isLikedByUser: false
      };

      onCommentAdded(commentWithUser);
      setContent('');
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