"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {BadgeCheck, Settings, Pencil, Shield, Check, X,} from "lucide-react";
import { Button } from "./ui/button";
import SettingsModal from "./SettingsModal"; // Adjust import path
import { useUserStore } from "@/store/useUserStore";

const UserProfile = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showSettings, setShowSettings] = useState(false); // New state

  const user = useUserStore((state)=> state.user)

  const [formData, setFormData] = useState({
    name: "Priya Sharma",
    username: "@priya_enterprises",
    location: "Mumbai, Maharashtra",
    website: "https://www.priyaenterprises.in",
    joinedDate: "June 2025",
    bio: "Entrepreneur | Fashion Designer | 📍 Mumbai | Creating beautiful ethnic wear ✨",
    isBusiness: false,
    businessCategory: "Fashion & Apparel",
    following: 20,
    followers: 15,
    posts: 1,
    profilePic:
      "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePic: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log("Saving profile data:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => setIsEditing(false);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm min-w-6xl">
      {/* Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-32 w-full relative">
        <div className="absolute -bottom-12 left-6">
          <div className="relative cursor-pointer" onClick={handleImageClick}>
            <Image
              src={formData.profilePic}
              alt={formData.name}
              width={96}
              height={96}
              className="rounded-full border-4 border-white w-32 h-32 object-cover"
            />
            <div className="absolute bottom-0 right-0 bg-yellow-500 rounded-full p-1 shadow">
              <CameraIcon className="w-4 h-4 text-white" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="pt-16 px-6 pb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 mr-4">
            {/* Name and Username */}
            <div className="flex items-center gap-2 mb-0">

              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="text-xl font-semibold text-gray-900 border-b-2 border-yellow-300 bg-transparent focus:outline-none focus:border-yellow-500 px-1"
                  placeholder="Your name"
                />
              ) : (
                <h1 className="text-2xl font-semibold text-gray-900">
                  {formData.name}
                </h1>
              )}
              <BadgeCheck className="text-blue-500 w-5 h-5" />
              {user?.isBusinessProfile && (
                <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                  Business Account <Shield className="w-3 h-3" />
                </span>
              )}
            </div>

            <p className="text-gray-500 text-sm mb-2">{"@ "+user?.username}</p>

            {/* Bio */}
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="w-full mt-2 text-sm text-gray-800 border-2 border-yellow-300 rounded-md p-2 focus:outline-none focus:border-yellow-500 resize-none"
                rows={3}
                placeholder="Tell people about yourself..."
              />
            ) : (
              <p className="mt-2 text-sm text-gray-800">{formData.bio}</p>
            )}

            {/* Business Category */}
            {formData.isBusiness && (
              <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 text-sm p-3 rounded-md mt-4 w-fit">
                <p className="font-semibold">Business Category</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.businessCategory}
                    onChange={(e) =>
                      handleInputChange("businessCategory", e.target.value)
                    }
                    className="bg-transparent border-b border-yellow-400 focus:outline-none focus:border-yellow-600 mt-1"
                    placeholder="Business category"
                  />
                ) : (
                  <p>{formData.businessCategory}</p>
                )}
              </div>
            )}

            {/* Location, Website, Joined */}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 flex-wrap">
              <div className="flex items-center gap-1">
                📍
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="border-b border-gray-300 bg-transparent focus:outline-none focus:border-yellow-500 px-1"
                    placeholder="Location"
                  />
                ) : (
                  <span>{formData.location}</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    className="text-yellow-700 underline border-b border-gray-300 bg-transparent focus:outline-none focus:border-yellow-500 px-1"
                    placeholder="Website URL"
                  />
                ) : (
                  <a
                    href={formData.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-yellow-700 underline"
                  >
                    {formData.website.replace("https://", "")}
                  </a>
                )}
              </div>

              <div>📅 Joined {formData.joinedDate}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1.5 rounded-md text-md font-medium flex items-center gap-1"
                >
                  <Check className="w-4 h-4" /> Save
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border px-4 py-1.5 rounded-md text-md font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="border px-4 py-1.5 rounded-md text-md font-medium text-black hover:bg-gray-100 flex items-center gap-1"
                >
                  <Pencil className="w-4 h-4" /> Edit Profile
                </Button>
                  <Button
          onClick={() => setShowSettings(true)}
          className="border px-2.5 py-1.5 rounded-md text-black hover:bg-gray-100"
        >
          <Settings className="w-4 h-4" />
        </Button>
              </>
            )}
          </div>
        </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}


        {/* Stats */}
        <div className="flex gap-6 mt-6 text-sm text-gray-700 font-medium">
          <span>
            <strong className="text-black">{formData.following}</strong>{" "}
            Following
          </span>
          <span>
            <strong className="text-black">{formData.followers}</strong>{" "}
            Followers
          </span>
          <span>
            <strong className="text-black">{formData.posts}</strong> Posts
          </span>
        </div>
      </div>
    </div>
  );
};

const CameraIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export default UserProfile;
