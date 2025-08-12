'use client'
import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Menu, X } from 'lucide-react';
import LeftSidebar from "@/components/LeftSidebar";
import CreatePostModal from "@/components/CreatePostModal";

const MainLayout = ({children}:{children:React.ReactNode}) => {

  const pathname = usePathname();
  const noSidebarRoutes = ['/onboarding','/signup', '/signin'];
  const isNoSidebar = noSidebarRoutes.some(path => pathname.startsWith(path));
  const [postToggle, setPostToggle] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false); // Close mobile sidebar on larger screens
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handlePostOpen = () => setPostToggle(true);
  const handlePostClose = () => {
    setPostToggle(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Mobile Hamburger Menu */}
      {!isNoSidebar && isMobile && (
        <div className="fixed bottom-4 left-4 z-50 md:hidden">
          <button
            onClick={toggleSidebar}
            className="p-3 bg-white rounded-full shadow-xl border border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {!isNoSidebar && isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={toggleSidebar} />
      )}

      {/* Left Sidebar */}
      {!isNoSidebar && (
        <div className={`
          ${isMobile 
            ? `fixed left-0 top-0 h-full bg-white border-r border-gray-200 overflow-y-auto z-50 transform transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'w-64 fixed left-0 h-full bg-white border-r border-gray-200 overflow-y-auto hidden md:block'
          }
          w-64
        `}>
          <LeftSidebar togglePost={handlePostOpen} onItemClick={() => isMobile && setSidebarOpen(false)} />
        </div>
      )}

      {/* Create Post Modal - Rendered via Portal */}
      {postToggle && typeof document !== 'undefined' && 
        createPortal(
          <CreatePostModal closeModal={handlePostClose}/>,
          document.body
        )
      }

      <div className={`${!isNoSidebar && !isMobile ? 'md:ml-64' : ''} min-h-screen bg-gray-50`}>
        {children}
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </>    
  )
}

export default MainLayout