"use client";

import Image from "next/image";
import { BadgeCheck, Settings, Pencil, Shield } from "lucide-react";

const UserProfile = () => {
  const user = {
    name: "Priya Sharma",
    username: "@priya_enterprises",
    location: "Mumbai, Maharashtra",
    website: "https://www.priyaenterprises.in",
    joinedDate: "June 2025",
    bio: "Entrepreneur | Fashion Designer | 📍 Mumbai | Creating beautiful ethnic wear ✨",
    isBusiness: true,
    businessCategory: "Fashion & Apparel",
    following: 20,
    followers: 15,
    posts: 1,
    profilePic: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm min-w-6xl ">
      {/* Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-32 w-full relative">
        <div className="absolute -bottom-12 left-6">
          <div className="relative">
            <Image
              src={user.profilePic}
              alt={user.name}
              width={96}
              height={96}
              className="rounded-full border-4 border-white w-24 h-24 object-cover"
            />
            <div className="absolute bottom-0 right-0 bg-yellow-500 rounded-full p-1 shadow">
              <CameraIcon className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="pt-16 px-6 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
              <BadgeCheck className="text-blue-500 w-5 h-5" />
              {user.isBusiness && (
                <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                  Business Account <Shield className="w-3 h-3" />
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm">{user.username}</p>
            <p className="mt-2 text-sm text-gray-800">{user.bio}</p>

            {/* Business Category */}
            {user.isBusiness && (
              <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 text-sm p-3 rounded-md mt-4 w-fit">
                <p className="font-semibold">Business Category</p>
                <p>{user.businessCategory}</p>
              </div>
            )}

            {/* Extra Info */}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 flex-wrap">
              <div>📍 {user.location}</div>
              <a href={user.website} target="_blank" rel="noreferrer" className="text-yellow-700 underline">
                {user.website.replace("https://", "")}
              </a>
              <div>📅 Joined {user.joinedDate}</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button className="border px-4 py-1.5 rounded-md text-md font-medium text-black hover:bg-gray-100 flex items-center gap-1">
              <Pencil className="w-5 h-5" /> Edit Profile
            </button>
            <button className="border px-2.5 py-1.5 rounded-md text-black hover:bg-gray-100">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-6 text-sm text-gray-700 font-medium">
          <span><strong className="text-black">{user.following}</strong> Following</span>
          <span><strong className="text-black">{user.followers}</strong> Followers</span>
          <span><strong className="text-black">{user.posts}</strong> Posts</span>
        </div>
      </div>
    </div>
  );
};

// Simple camera icon fallback if you're not using heroicons/lucide-react
const CameraIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M15 10l4.553 2.276a1 1 0 010 1.789L15 16.34V10z" />
    <path
      d="M21 12c0 4.971-4.029 9-9 9s-9-4.029-9-9 4.029-9 9-9 9 4.029 9 9z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default UserProfile;
