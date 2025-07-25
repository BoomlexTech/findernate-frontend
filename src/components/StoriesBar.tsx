"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useStories } from "@/hooks/useStories";
import { useUserStore } from "@/store/useUserStore";
import { StoryUser, Story } from "@/types/story";
import { Plus } from "lucide-react";
import StoryViewer from "./StoryViewer";
import CreateStoryModal from "./CreateStoryModal";
import StoryAnalytics from "./StoryAnalytics";

interface StoriesBarProps {
  onCreateStory?: () => void;
}

const VIEWED_STORIES_KEY = 'findernate_viewed_stories';

// Helper functions for localStorage
const loadViewedStoriesFromStorage = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  
  try {
    const stored = localStorage.getItem(VIEWED_STORIES_KEY);
    if (stored) {
      const parsedArray = JSON.parse(stored);
      return new Set(parsedArray);
    }
  } catch (error) {
    console.error('Error loading viewed stories from localStorage:', error);
  }
  return new Set();
};

const saveViewedStoriesToStorage = (viewedStories: Set<string>) => {
  if (typeof window === 'undefined') return;
  
  try {
    const arrayToStore = Array.from(viewedStories);
    localStorage.setItem(VIEWED_STORIES_KEY, JSON.stringify(arrayToStore));
  } catch (error) {
    console.error('Error saving viewed stories to localStorage:', error);
  }
};

export default function StoriesBar({ onCreateStory }: StoriesBarProps) {
  const [selectedUser, setSelectedUser] = useState<StoryUser | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsStory, setAnalyticsStory] = useState<Story | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(loadViewedStoriesFromStorage);
  
  const { user, token } = useUserStore();
  
  // Always call useStories - hooks must be called unconditionally
  const { storyUsers, loading, hasActiveStories, uploadStory } = useStories();

  // Clean up expired stories from viewed list
  useEffect(() => {
    if (storyUsers.length > 0) {
      const currentStoryIds = new Set<string>();
      storyUsers.forEach(user => {
        user.stories?.forEach(story => {
          currentStoryIds.add(story._id);
        });
      });

      setViewedStories(prev => {
        const filteredViewed = new Set(Array.from(prev).filter(storyId => 
          currentStoryIds.has(storyId)
        ));
        
        // Only save if there were changes
        if (filteredViewed.size !== prev.size) {
          saveViewedStoriesToStorage(filteredViewed);
        }
        
        return filteredViewed;
      });
    }
  }, [storyUsers]);
  
  console.log('StoriesBar - User data:', user); // Debug log
  console.log('StoriesBar - Token:', token); // Debug token
  if (typeof window !== 'undefined') {
    console.log('StoriesBar - LocalStorage user-storage:', localStorage.getItem('user-storage')); // Debug localStorage
    console.log('StoriesBar - LocalStorage token:', localStorage.getItem('token')); // Debug token key
    console.log('StoriesBar - All localStorage keys:', Object.keys(localStorage)); // Show all keys
  }

  // Always render something - don't return null
  if (!user) {
    // Show a placeholder while user data loads or if user needs to log in
    return (
      <div className="flex overflow-x-auto space-x-6 pb-2 px-2 scrollbar-hide bg-white shadow-md rounded-lg">
        <div className="flex flex-col items-center mt-5 flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center cursor-pointer hover:bg-blue-200 transition-colors">
            <Plus size={24} className="text-blue-600" />
          </div>
          <p className="text-xs mt-2 text-center text-gray-700 font-medium max-w-[64px] truncate">
            {token ? 'Your Story' : 'Login for Stories'}
          </p>
        </div>
      </div>
    );
  }

  const openStoryModal = (storyUser: StoryUser) => {
    console.log('Clicked on story user:', storyUser); // Debug log
    
    // If current user has no stories, show create modal
    if (storyUser.isCurrentUser && (!storyUser.stories || storyUser.stories.length === 0)) {
      handleCreateStory();
      return;
    }
    
    // For all other cases (current user with stories OR other users with stories), show story viewer
    if (storyUser.stories && storyUser.stories.length > 0) {
      setSelectedUser(storyUser);
      // Start from the first unviewed story (Instagram behavior)
      const startIndex = getFirstUnviewedStoryIndex(storyUser);
      setCurrentStoryIndex(startIndex);
    }
  };

  const closeStoryModal = () => {
    setSelectedUser(null);
    setCurrentStoryIndex(0);
  };

  const handleStoryViewed = (storyId: string) => {
    setViewedStories(prev => {
      const newViewedStories = new Set(prev).add(storyId);
      saveViewedStoriesToStorage(newViewedStories);
      return newViewedStories;
    });
  };

  const areAllStoriesViewed = (storyUser: StoryUser): boolean => {
    if (!storyUser.stories || storyUser.stories.length === 0) return false;
    return storyUser.stories.every(story => viewedStories.has(story._id));
  };

  const getFirstUnviewedStoryIndex = (storyUser: StoryUser): number => {
    if (!storyUser.stories || storyUser.stories.length === 0) return 0;
    
    // Find the first story that hasn't been viewed
    const firstUnviewedIndex = storyUser.stories.findIndex(story => !viewedStories.has(story._id));
    
    // If all stories are viewed, start from the beginning (0)
    // If some are unviewed, start from the first unviewed story
    return firstUnviewedIndex === -1 ? 0 : firstUnviewedIndex;
  };

  const handleCreateStory = () => {
    setShowCreateModal(true);
  };

  const handleStoryUpload = async (media: File, caption?: string) => {
    const success = await uploadStory(media, caption);
    if (success) {
      setShowCreateModal(false);
    }
    return success;
  };

  const handleShowAnalytics = (story: Story) => {
    setAnalyticsStory(story);
    setShowAnalytics(true);
  };

  const handleCloseAnalytics = () => {
    setShowAnalytics(false);
    setAnalyticsStory(null);
  };

  console.log('StoriesBar - storyUsers from API:', storyUsers); // Debug stories from API
  console.log('StoriesBar - loading:', loading); // Debug loading state

  // Use actual story users from API, or create current user if no stories
  let displayUsers = [...storyUsers];
  
  // If user exists but doesn't appear in story users (no stories), add them
  if (user && !storyUsers.some(storyUser => storyUser.isCurrentUser)) {
    const currentUserStory: StoryUser = {
      _id: user._id,
      username: user.username || user.fullName || 'You',
      profileImageUrl: user.profileImageUrl || '',
      stories: [],
      hasNewStories: false,
      isCurrentUser: true,
    };
    displayUsers.unshift(currentUserStory); // Add current user at the beginning
  }

  // Remove loading state for now - we'll show user immediately

  return (
    <>
      <div className="flex overflow-x-auto space-x-6 pb-2 px-2 scrollbar-hide bg-white shadow-md rounded-lg">
        {displayUsers.map((storyUser) => (
          <div key={storyUser._id} className="flex flex-col items-center mt-5 flex-shrink-0">
            <div
              onClick={() => openStoryModal(storyUser)}
              className={`relative w-16 h-16 rounded-full border-2 ${
                areAllStoriesViewed(storyUser)
                  ? "border-gray-400"
                  : storyUser.hasNewStories
                  ? "border-2 bg-gradient-to-r from-pink-500 to-purple-500 p-[2px]"
                  : "border-gray-300"
              } overflow-hidden cursor-pointer transition-transform hover:scale-105`}
            >
              <div className={`w-full h-full rounded-full overflow-hidden ${
                storyUser.hasNewStories && !areAllStoriesViewed(storyUser) ? 'bg-white p-[2px]' : ''
              }`}>
                {storyUser.profileImageUrl ? (
                  <Image
                    src={storyUser.profileImageUrl}
                    alt={storyUser.username}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      {storyUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Add story plus icon for current user with no stories */}
              {storyUser.isCurrentUser && (!storyUser.stories || storyUser.stories.length === 0) && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Plus size={12} className="text-white" />
                </div>
              )}
              
              {/* New story indicator for others */}
              {storyUser.hasNewStories && storyUser.stories && storyUser.stories.length > 0 && !storyUser.isCurrentUser && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <p className="text-xs mt-2 text-center text-gray-700 font-medium max-w-[64px] truncate">
              {storyUser.isCurrentUser ? "Your Story" : storyUser.username}
            </p>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {selectedUser && (
        <StoryViewer
          storyUser={selectedUser}
          initialStoryIndex={currentStoryIndex}
          allStoryUsers={displayUsers}
          onClose={closeStoryModal}
          onShowAnalytics={handleShowAnalytics}
          onStoryViewed={handleStoryViewed}
        />
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <CreateStoryModal
          onClose={() => setShowCreateModal(false)}
          onUpload={handleStoryUpload}
        />
      )}

      {/* Story Analytics Modal - Independent of StoryViewer */}
      {showAnalytics && analyticsStory && (
        <StoryAnalytics
          story={analyticsStory}
          onClose={handleCloseAnalytics}
        />
      )}
    </>
  );
}
