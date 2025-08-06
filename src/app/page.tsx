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
      <div className="max-w-7xl mx-auto flex">
        {/* Main Content Area */}
        <div className="flex-1 md:pr-[23rem] pr-0">
          {/* Mobile Logo - Only visible on small screens */}
          <div className="md:hidden bg-gray-50 pt-4 pb-2 px-4 border-b border-gray-200">
            <div className="flex justify-center">
              <Image
                src="/Findernate_Logo.png"
                alt="FinderNate Logo"
                width={160}
                height={60}
                className="object-contain"
              />
            </div>
          </div>

          {/* Stories Bar - Sticky on desktop, scrollable on mobile */}
          <div className="md:sticky md:top-0 md:z-10 bg-gray-50 pt-4 px-4">
            <StoriesBar />
          </div>

          {/* Posts - Scrollable */}
          <div className="overflow-y-auto">
            <MainContent />
          </div>
        </div>

        {/* Right Sidebar - Hidden on mobile, Fixed on desktop */}
        <div className="hidden md:block w-[23rem] fixed right-0 top-0 h-full bg-white border-l border-gray-200 overflow-y-auto">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
