import axiosInstance from './base';
import { Story, StoryAnalytics, CreateStoryRequest, StoryUploadResponse } from '@/types/story';

export const storyAPI = {
  // Upload a new story
  uploadStory: async (data: CreateStoryRequest): Promise<StoryUploadResponse> => {
    const formData = new FormData();
    formData.append('media', data.media);
    if (data.caption) {
      formData.append('caption', data.caption);
    }

    const response = await axiosInstance.post('/stories/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Fetch stories feed (from followed users + self)
  fetchStoriesFeed: async (): Promise<Story[]> => {
    const response = await axiosInstance.get('/stories/feed');
    return response.data.data;
  },

  // Fetch stories by specific user
  fetchStoriesByUser: async (userId: string): Promise<Story[]> => {
    const response = await axiosInstance.get(`/stories/user/${userId}`);
    return response.data.data;
  },

  // Mark story as seen
  markStorySeen: async (storyId: string): Promise<void> => {
    await axiosInstance.post('/stories/seen', { storyId });
  },

  // Get story viewers/analytics
  fetchStoryViewers: async (
    storyId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<StoryAnalytics> => {
    const response = await axiosInstance.get(
      `/stories/${storyId}/viewers?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  // Save a story
  saveStory: async (storyId: string) => {
    const response = await axiosInstance.post('/stories/save', { storyId });
    return response.data;
  },

  // Get saved stories
  getSavedStories: async () => {
    const response = await axiosInstance.get('/stories/saved');
    return response.data.data;
  },

  // Unsave a story
  unsaveStory: async (storyId: string) => {
    const response = await axiosInstance.delete(`/stories/save/${storyId}`);
    return response.data;
  },

  // Delete a story (if needed)
  deleteStory: async (storyId: string): Promise<void> => {
    await axiosInstance.delete(`/stories/${storyId}`);
  },
};