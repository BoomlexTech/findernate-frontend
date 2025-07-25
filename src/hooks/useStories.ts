import { useState, useEffect, useCallback } from 'react';
import { storyAPI } from '@/api/story';
import { Story, StoryUser, StoryFeed } from '@/types/story';
import { useUserStore } from '@/store/useUserStore';

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [storyUsers, setStoryUsers] = useState<StoryUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore();

  // Transform stories array into grouped story users
  const transformStoriesToUsers = useCallback((storiesData: Story[]): StoryUser[] => {
    if (!user) return [];

    const userMap = new Map<string, StoryUser>();
    
    // Add current user first if they have stories
    const currentUserStories = storiesData.filter(story => story.userId._id === user._id);
    if (currentUserStories.length > 0) {
      userMap.set(user._id, {
        _id: user._id,
        username: user.username || user.fullName,
        profileImageUrl: user.profileImageUrl,
        stories: currentUserStories,
        hasNewStories: true,
        isCurrentUser: true,
      });
    }

    // Add other users' stories
    storiesData.forEach(story => {
      if (story.userId._id === user._id) return; // Skip current user, already added

      const userId = story.userId._id;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          _id: userId,
          username: story.userId.username,
          profileImageUrl: story.userId.profileImageUrl,
          stories: [],
          hasNewStories: true,
          isCurrentUser: false,
        });
      }
      
      const storyUser = userMap.get(userId)!;
      storyUser.stories.push(story);
    });

    // Sort stories within each user by creation time (oldest first, newest last)
    Array.from(userMap.values()).forEach(storyUser => {
      storyUser.stories.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      // Debug logging for story sorting
      if (storyUser.stories.length > 1) {
        console.log(`Stories for ${storyUser.username} (oldest to newest):`, storyUser.stories.map(s => ({
          id: s._id,
          createdAt: s.createdAt,
          caption: s.caption
        })));
      }
    });

    // Convert to array and sort: current user first, then by most recent story
    const result = Array.from(userMap.values());
    return result.sort((a, b) => {
      if (a.isCurrentUser) return -1;
      if (b.isCurrentUser) return 1;
      
      const aLatest = new Date(a.stories[0]?.createdAt || 0).getTime();
      const bLatest = new Date(b.stories[0]?.createdAt || 0).getTime();
      return bLatest - aLatest;
    });
  }, [user]);

  // Fetch stories feed
  const fetchStories = useCallback(async () => {
    if (!user) {
      setStories([]);
      setStoryUsers([]);
      setLoading(false);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const storiesData = await storyAPI.fetchStoriesFeed();
      setStories(storiesData);
      const transformedUsers = transformStoriesToUsers(storiesData);
      setStoryUsers(transformedUsers);
    } catch (err: any) {
      setError('Failed to fetch stories');
      console.error('Error fetching stories:', err);
      // Set empty data on error to prevent crashes
      setStories([]);
      setStoryUsers([]);
    } finally {
      setLoading(false);
    }
  }, [user, transformStoriesToUsers]);

  // Upload a new story
  const uploadStory = useCallback(async (media: File, caption?: string) => {
    if (!user) {
      console.warn('Cannot upload story: User not authenticated');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await storyAPI.uploadStory({ media, caption });
      // Refresh stories after upload
      await fetchStories();
      return true;
    } catch (err) {
      setError('Failed to upload story');
      console.error('Error uploading story:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchStories]);

  // Mark story as seen
  const markStoryAsSeen = useCallback(async (storyId: string) => {
    if (!user) {
      console.warn('Cannot mark story as seen: User not authenticated');
      return;
    }
    
    try {
      await storyAPI.markStorySeen(storyId);
    } catch (err) {
      console.error('Error marking story as seen:', err);
    }
  }, [user]);

  // Check if current user has any active stories
  const hasActiveStories = useCallback(() => {
    if (!user) return false;
    return storyUsers.some(storyUser => storyUser.isCurrentUser && storyUser.stories.length > 0);
  }, [user, storyUsers]);

  // Get current user's story user object
  const getCurrentUserStories = useCallback((): StoryUser | null => {
    return storyUsers.find(storyUser => storyUser.isCurrentUser) || null;
  }, [storyUsers]);

  // Initial fetch
  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  return {
    stories,
    storyUsers,
    loading,
    error,
    fetchStories,
    uploadStory,
    markStoryAsSeen,
    hasActiveStories,
    getCurrentUserStories,
  };
};