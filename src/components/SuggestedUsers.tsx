// SuggestedUsers.tsx
'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';

const suggestedUsers = [
  {
    id: 1,
    name: 'Alex Thompson',
    username: '@alexthompson',
    followers: 12500,
    profilePic: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: 2,
    name: 'Jessica Wu',
    username: '@jessicawu',
    followers: 8900,
    profilePic: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: 3,
    name: 'David Miller',
    username: '@davidmiller',
    followers: 15200,
    profilePic: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: 4,
    name: 'Sophie Chen',
    username: '@sophiechen',
    followers: 6700,
    profilePic: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
  }
];

export default function SuggestedUsers() {
  const formatFollowers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="  bg-gray-100 rounded-xl shadow-sm border border-gray-200 p-6">
     <div className="flex items-center gap-2 mb-4">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-users w-5 h-5 text-gray-600"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
  <h3 className="text-lg font-semibold text-gray-900">Suggested for You</h3>
</div>

      <div className="space-y-4">
        {suggestedUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className='flex gap-4 justify-center items-center'>
                {/* Removed Avatar */}
                <Image
                width={20}
                height={20}
                src={user.profilePic}
                alt='profile_image'
                className="w-10 h-10 rounded-full object-cover"
                />
              <div>    
              <p className="font-medium text-gray-900 text-sm">{user.name}</p>
              <p className="text-xs text-gray-600">{user.username}</p>
              <p className="text-xs text-gray-500">{formatFollowers(user.followers)} followers</p>
              </div>  
            </div>
            <Button
              size="sm"
              variant="custom"
              className="text-xs px-4 py-1 bg-button-gradient border-[#FCD45C] text-white hover:bg-[#FCD45C] cursor-pointer"
            >
              Follow
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
