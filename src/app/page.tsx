"use client";

import MainContent from '@/components/MainContent';
import RightSidebar from '@/components/RightSidebar';
import { useUserStore } from '@/store/useUserStore';
import { useEffect } from 'react';

export default function Home() {
    const user = useUserStore((state) => state.user);

  useEffect(() => {
    console.log('Zustand user:', user);
  }, [user]);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex">

        {/* Main Content */}
        <div className="flex-1 pl-20 pr-[23rem]">
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