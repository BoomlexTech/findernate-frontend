"use client";

import { useEffect } from "react";
import MainContent from "@/components/MainContent";
import RightSidebar from "@/components/RightSidebar";
import StoriesBar from "@/components/StoriesBar";
import { useUserStore } from "@/store/useUserStore";


export default function Home() {
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    console.log("Zustand user:", user);
  }, [user]);


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex">
        {/* Main Content Area */}
        <div className="flex-1  pr-[23rem]">
          {/* Stories Bar - Sticky within main content */}
          <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 py-4 px-4 mb-4">
            <StoriesBar />
          </div>

          {/* Posts - Scrollable */}
          <div className="overflow-y-auto">
            <MainContent />
          </div>
        </div>

        {/* Right Sidebar - Fixed */}
        <div className="w-[23rem] fixed right-0 top-0 h-full bg-white border-l border-gray-200 overflow-y-auto">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
