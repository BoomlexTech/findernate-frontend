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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested for You</h3>
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
              className="text-xs px-4 py-1 bg-[#DBB42C] border-[#FCD45C] text-white hover:bg-[#FCD45C]"
            >
              Follow
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
