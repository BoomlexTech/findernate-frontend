import { getUserProfile } from '@/api/user';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

type floatingHeaderProps = {
    paragraph: string;
    heading: string;
    username: string;
    accountBadge: boolean;
    width?: string;
    showCreateButton?: boolean;
    onCreateClick?: () => void;
}
interface profileProps{
  fullName: string;
  profileImageUrl: string;
}

const FloatingHeader = ({paragraph, heading, username, accountBadge, width="", showCreateButton = false, onCreateClick}: floatingHeaderProps) => {
  const [profile, setProfile] = useState<profileProps | null>(null);



      useEffect(()=>{
        const fetchProfile = async () => {
          try{
            const data = await getUserProfile();
            console.log(data)
            setProfile(data.userId)
          } catch(err){
            console.log(err)
          }
        }
        fetchProfile();
      },[]);

  return (
          <div className={`bg-white p-6 rounded-xl shadow-sm flex justify-between items-center mb-6 ${width || 'min-w-6xl w-full'}`}>
            {/* Left Text */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{heading}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {paragraph}
              </p>
            </div>
    
            {/* Right Content */}
            <div className="flex items-center space-x-4">
              {/* Create Post Button */}
              {/* {showCreateButton && (
                <button 
                  onClick={onCreateClick}
                  className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" /> Create Post
                </button>
              )} */}
              
              {/* Profile Info */}
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-end">
                  <span className="font-medium text-gray-900">{profile?.fullName}</span>
                  {accountBadge && (
                    <span className="text-gray-400 text-xs">
                      {"Business Account"}
                    </span>
                  )}
                </div>
                 <Link href={'/profile'}>
                {profile?.profileImageUrl ? (
                  <Image
                    src={profile?.profileImageUrl}
                    alt={username}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                 </Link>
              </div>
            </div>
    
          </div>
  )
}

export default FloatingHeader
