"use client";

import Image from "next/image";
import { useState } from "react";

// Type definitions
interface Story {
  id: number;
  image: string;
  timestamp: string;
}

interface User {
  id: number;
  name: string;
  image: string;
  isNew: boolean;
  stories: Story[];
}

// Dummy story users
const storyUsers: User[] = [
  {
    id: 1,
    name: "You",
    image: "https://picsum.photos/seed/you/100",
    isNew: false,
    stories: [
      { id: 1, image: "https://picsum.photos/seed/you1/400/600", timestamp: "2 hours ago" },
      { id: 2, image: "https://picsum.photos/seed/you2/400/600", timestamp: "4 hours ago" }
    ]
  },
  {
    id: 2,
    name: "Sarah",
    image: "https://picsum.photos/seed/sarah/100",
    isNew: true,
    stories: [
      { id: 1, image: "https://picsum.photos/seed/sarah1/400/600", timestamp: "1 hour ago" },
      { id: 2, image: "https://picsum.photos/seed/sarah2/400/600", timestamp: "3 hours ago" },
      { id: 3, image: "https://picsum.photos/seed/sarah3/400/600", timestamp: "5 hours ago" }
    ]
  },
  {
    id: 3,
    name: "Mike",
    image: "https://picsum.photos/seed/mike/100",
    isNew: true,
    stories: [
      { id: 1, image: "https://picsum.photos/seed/mike1/400/600", timestamp: "30 minutes ago" }
    ]
  },
  {
    id: 4,
    name: "Emma",
    image: "https://picsum.photos/seed/emma/100",
    isNew: false,
    stories: [
      { id: 1, image: "https://picsum.photos/seed/emma1/400/600", timestamp: "6 hours ago" },
      { id: 2, image: "https://picsum.photos/seed/emma2/400/600", timestamp: "8 hours ago" }
    ]
  },
  {
    id: 5,
    name: "Alex",
    image: "https://picsum.photos/seed/alex/100",
    isNew: true,
    stories: [
      { id: 1, image: "https://picsum.photos/seed/alex1/400/600", timestamp: "45 minutes ago" }
    ]
  },
  {
    id: 6,
    name: "Lisa",
    image: "https://picsum.photos/seed/lisa/100",
    isNew: false,
    stories: [
      { id: 1, image: "https://picsum.photos/seed/lisa1/400/600", timestamp: "7 hours ago" },
      { id: 2, image: "https://picsum.photos/seed/lisa2/400/600", timestamp: "9 hours ago" }
    ]
  }
];

export default function StoriesBar() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const openStoryModal = (user: User) => {
    setSelectedUser(user);
    setCurrentStoryIndex(0);
  };

  const closeStoryModal = () => {
    setSelectedUser(null);
    setCurrentStoryIndex(0);
  };

  const nextStory = () => {
    if (selectedUser && currentStoryIndex < selectedUser.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else if (selectedUser) {
      const currentUserIndex = storyUsers.findIndex(user => user.id === selectedUser.id);
      const nextUserIndex = currentUserIndex + 1;
      if (nextUserIndex < storyUsers.length) {
        setSelectedUser(storyUsers[nextUserIndex]);
        setCurrentStoryIndex(0);
      } else {
        closeStoryModal();
      }
    }
  };

  const prevStory = () => {
    if (!selectedUser) return;
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      const currentUserIndex = storyUsers.findIndex(user => user.id === selectedUser.id);
      const prevUserIndex = currentUserIndex - 1;
      if (prevUserIndex >= 0) {
        setSelectedUser(storyUsers[prevUserIndex]);
        setCurrentStoryIndex(storyUsers[prevUserIndex].stories.length - 1);
      }
    }
  };

  return (
    <>
      <div className="flex overflow-x-auto space-x-6 pb-2 px-2 scrollbar-hide bg-white shadow-md rounded-lg">
        {storyUsers.map((user) => (
          <div key={user.id} className="flex flex-col items-center mt-5 flex-shrink-0">
            <div
              onClick={() => openStoryModal(user)}
              className={`relative w-16 h-16 rounded-full border-2 ${
                user.isNew
                  ? "border-gradient-to-r from-pink-500 to-purple-500 p-[2px]"
                  : "border-gray-300"
              } overflow-hidden cursor-pointer transition-transform hover:scale-105`}
            >
              <div className={`w-full h-full rounded-full overflow-hidden ${user.isNew ? 'bg-white p-[2px]' : ''}`}>
                <Image
                  src={user.image}
                  alt={user.name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full rounded-full"
                />
              </div>
              {user.isNew && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <p className="text-xs mt-2 text-center text-gray-700 font-medium max-w-[64px] truncate">
              {user.name}
            </p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-md w-full h-[80vh] bg-black rounded-lg overflow-hidden">
            {/* Progress Bars */}
            <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
              {selectedUser.stories.map((_, index) => (
                <div key={index} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-white transition-all duration-300 ${
                      index === currentStoryIndex ? "w-full" : index < currentStoryIndex ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* User Info */}
            <div className="absolute top-8 left-4 right-4 flex items-center space-x-3 z-10">
              <Image
                src={selectedUser.image}
                alt={selectedUser.name}
                width={32}
                height={32}
                className="rounded-full border-2 border-white"
              />
              <div>
                <p className="text-white font-medium text-sm">{selectedUser.name}</p>
                <p className="text-gray-300 text-xs">
                  {selectedUser.stories[currentStoryIndex]?.timestamp}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={closeStoryModal}
              className="absolute top-6 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Story Image */}
            <div className="relative w-full h-full">
              <Image
                src={selectedUser.stories[currentStoryIndex]?.image}
                alt={`${selectedUser.name}'s story`}
                fill={true}
                className="object-cover"
              />
              <div className="absolute inset-0 flex">
                <div className="w-1/2 h-full cursor-pointer" onClick={prevStory} />
                <div className="w-1/2 h-full cursor-pointer" onClick={nextStory} />
              </div>
            </div>

            {/* Navigation Arrows */}
            {currentStoryIndex > 0 && (
              <button
                onClick={prevStory}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {selectedUser && currentStoryIndex < selectedUser.stories.length - 1 && (
              <button
                onClick={nextStory}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
