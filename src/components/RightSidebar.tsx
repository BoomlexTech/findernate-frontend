"use client";

import SuggestedUsers from '@/components/SuggestedUsers';
import TrendingBusiness from '@/components/TrendingBusiness';

export default function RightSidebar() {
  return (
    <div className="p-6 h-full space-y-6">
      <SuggestedUsers />
      <TrendingBusiness />
    </div>
  );
}