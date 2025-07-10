'use client'
import React, { useState } from 'react'
import { usePathname } from 'next/navigation';
import LeftSidebar from "@/components/LeftSidebar";
import CreatePostModal from "@/components/CreatePostModal";

const MainLayout = ({children}:{children:React.ReactNode}) => {

  const pathname = usePathname();
  const noSidebarRoutes = ['/onboarding','/signup', '/signin'];
  const isNoSidebar = noSidebarRoutes.some(path => pathname.startsWith(path));
  const [postToggle, setPostToggle] = useState(false);
  const handlePostOpen = () => setPostToggle(true);
  const handlePostClose = () => setPostToggle(false);

  return (
    <>
            {/* Left Sidebar */}
        
          {!isNoSidebar&&
          <div className="w-64 fixed left-0 h-full bg-white border-r border-gray-200 overflow-y-auto">
          <LeftSidebar togglePost={handlePostOpen}/>
          </div>
          }
        
        
          {postToggle && 
          <div>
            <CreatePostModal closeModal={handlePostClose}/>
          </div>
          }
        <div className={!isNoSidebar ? 'ml-64' : '' + ' min-h-screen bg-gray-50'}>
        {children}
        </div>
    </>    
  )
}

export default MainLayout
