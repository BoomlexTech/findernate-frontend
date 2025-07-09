import Image from 'next/image';
import React from 'react'

type floatingHeaderProps = {
    paragraph: string;
    heading: string;
    username: string;
    accountBadge: boolean;
}

const FloatingHeader = ({paragraph, heading, username, accountBadge}: floatingHeaderProps) => {

    const user = {
        profilePic: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png", // or a remote image if configured
    };
  return (
          <div className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-center mb-6 min-w-6xl w-full">
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
                <span className="font-medium text-gray-900">{username}</span>
                {accountBadge && (
                  <span
                    className="text-gray-400 text-xs">
                    {"Business Account"}
                  </span>
                )}
              </div>
              <Image
                src={user.profilePic}
                alt={username}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
    
          </div>
  )
}

export default FloatingHeader
