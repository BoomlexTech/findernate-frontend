import axios from './base';

export interface Comment {
  _id: string;
  postId: string;
  userId: string | {
    _id: string;
    username: string;
    fullName: string;
    profileImageUrl?: string;
  };
  content: string;
  parentCommentId?: string;
  likes: string[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    username: string;
    fullName: string;
    profileImageUrl?: string;
  };
  replies?: Comment[];
  likesCount?: number;
  isLikedByUser?: boolean;
}

export interface CreateCommentData {
  postId: string;
  content: string;
  parentCommentId?: string;
}

// Get comments for a post  
export const getCommentsByPost = async (postId: string, page: number = 1, limit: number = 20) => {
  const response = await axios.get('/posts/comments', {
    params: { postId, page, limit }
  });
  return response.data.data;
};

// Create a new comment
export const createComment = async (data: CreateCommentData) => {
  const response = await axios.post('/posts/comment', data);
  return response.data.data;
};

// Get single comment
export const getCommentById = async (commentId: string) => {
  const response = await axios.get(`/posts/comment/${commentId}`);
  return response.data.data;
};

// Update comment
export const updateComment = async (commentId: string, content: string) => {
  const response = await axios.put(`/posts/comment/${commentId}`, { content });
  return response.data.data;
};

// Delete comment
export const deleteComment = async (commentId: string) => {
  const response = await axios.delete(`/posts/comment/${commentId}`);
  return response.data;
};

// Like comment
export const likeComment = async (commentId: string) => {
  const response = await axios.post('/posts/like-comment', { commentId });
  return response.data;
};

// Unlike comment
export const unlikeComment = async (commentId: string) => {
  const response = await axios.post('/posts/unlike-comment', { commentId });
  return response.data;
};