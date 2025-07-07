"use client";

import MainContent from '@/components/MainContent';
import RightSidebar from '@/components/RightSidebar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex">

        {/* Main Content */}
        <div className="flex-1 ml-64 mr-80">
          <MainContent />
        </div>

        {/* Right Sidebar */}
        <div className="w-[23rem] fixed right-0 h-full bg-white border-l border-gray-200 overflow-y-auto">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}