'use client'
import React, { useState } from 'react'
import { usePathname } from 'next/navigation';
import LeftSidebar from "@/components/LeftSidebar";
import CreatePostModal from "@/components/CreatePostModal";
import SuccessToast from "@/components/SuccessToast";

const MainLayout = ({children}:{children:React.ReactNode}) => {

  const pathname = usePathname();
  const noSidebarRoutes = ['/onboarding','/signup', '/signin'];
  const isNoSidebar = noSidebarRoutes.some(path => pathname.startsWith(path));
  const [postToggle, setPostToggle] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePostOpen = () => setPostToggle(true);
  const handlePostClose = () => {
    setPostToggle(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <>
      {/* Left Sidebar */}
      {!isNoSidebar && (
        <div className="w-64 fixed left-0 h-full bg-white border-r border-gray-200 overflow-y-auto">
          <LeftSidebar togglePost={handlePostOpen}/>
        </div>
      )}

      {/* Create Post Modal */}
      {postToggle && (
        <div>
          <CreatePostModal closeModal={handlePostClose}/>
        </div>
      )}

      {/* Success Toast */}
      <SuccessToast show={showSuccess} message="Post created successfully!" />

      <div className={!isNoSidebar ? 'ml-64' : '' + ' min-h-screen bg-gray-50'}>
        {children}
      </div>
    </>    
  )
}

export default MainLayout
