'use client'
import React, { useState } from 'react'
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LeftSidebar from "@/components/LeftSidebar";
import CreatePostModal from "@/components/CreatePostModal";

const MainLayout = ({children}:{children:React.ReactNode}) => {

  const pathname = usePathname();
  const noSidebarRoutes = ['/onboarding','/signup', '/signin'];
  const isNoSidebar = noSidebarRoutes.some(path => pathname.startsWith(path));
  const [postToggle, setPostToggle] = useState(false);

  const handlePostOpen = () => setPostToggle(true);
  const handlePostClose = () => {
    setPostToggle(false);
    // Removed automatic success toast - let CreatePostModal handle its own success state
  };

  return (
    <>
      {/* Left Sidebar */}
      {!isNoSidebar && (
        <div className="w-64 fixed left-0 h-full bg-white border-r border-gray-200 overflow-y-auto">
          <LeftSidebar togglePost={handlePostOpen}/>
        </div>
      )}

      {/* Create Post Modal - Rendered via Portal */}
      {postToggle && typeof document !== 'undefined' && 
        createPortal(
          <CreatePostModal closeModal={handlePostClose}/>,
          document.body
        )
      }

      <div className={`${!isNoSidebar ? 'ml-64' : ''} min-h-screen bg-gray-50`}>
        {children}
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </>    
  )
}

export default MainLayout