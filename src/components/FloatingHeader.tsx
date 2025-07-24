import { getUserProfile } from '@/api/user';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

type floatingHeaderProps = {
    paragraph: string;
    heading: string;
    username: string;
    accountBadge: boolean;
    width?: string;
}
interface profileProps{
  fullName: string;
  profileImageUrl: string;
}

const FloatingHeader = ({paragraph, heading, username, accountBadge, width=""}: floatingHeaderProps) => {
  const [profile, setProfile] = useState<profileProps | null>(null);



      useEffect(()=>{
        const fetchProfile = async () => {
          try{
            const data = await getUserProfile();
            setProfile(data)
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
    
            {/* Right Profile Info */}
            <div className="flex items-center space-x-3">
              
              <div className="flex flex-col items-end">
                <span className="font-medium text-gray-900">{profile?.fullName}</span>
                {accountBadge && (
                  <span
                    className="text-gray-400 text-xs">
                    {"Business Account"}
                  </span>
                )}
              </div>
              {profile?.profileImageUrl &&
               <Image
                src={profile?.profileImageUrl}
                alt={username}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />}
             
            </div>
    
          </div>
  )
}

export default FloatingHeader
