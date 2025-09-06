"use client";

// import { useEffect } from "react";
import Image from "next/image";
import MainContent from "@/components/MainContent";
import RightSidebar from "@/components/RightSidebar";
import StoriesBar from "@/components/StoriesBar";
// import { useUserStore } from "@/store/useUserStore";


export default function Home() {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto flex">
        {/* Main Content Area */}
        <div className="flex-1 lg:pr-[23rem] pr-0">
          {/* Mobile Logo - Only visible on small screens */}
          <div className="lg:hidden pt-4">
            <div className="flex justify-center w-full">
              <Image
                src="/Findernate_Logo.png"
                alt="FinderNate Logo"
                width={220}     
                height={200}
                className="h-12 sm:h-16 w-auto max-w-full object-contain px-4 sm:px-6"
              />
            </div>
          </div>

          {/* Stories Bar - Sticky on desktop, scrollable on mobile/medium */}
          <div className="lg:top-0 lg:z-20 bg-gray-50 px-0">
            <StoriesBar />
          </div>

          {/* Posts - Scrollable */}
          <div className="overflow-y-auto">
            <MainContent />
          </div>
        </div>

        {/* Right Sidebar - Hidden on mobile and medium screens, Fixed on large desktop */}
        <div className="hidden lg:block w-[23rem] fixed right-0 top-0 h-full bg-white border-l border-gray-200 overflow-y-auto">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
