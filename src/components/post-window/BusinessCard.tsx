// components/BusinessPostCard.jsx

import { Building2, Megaphone, Ticket } from 'lucide-react';
import { useState } from 'react';
import ProductServiceDetails from '../ProductServiceDetails';
import { FeedPost } from '@/types';

interface BusinessPostCardProps {
  post?: FeedPost;
}

const BusinessPostCard = ({ post }: BusinessPostCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  return (
    // Main card container
    <div className="max-w-sm rounded-2xl border border-violet-500 bg-violet-200 p-2 shadow-md font-sans">
      
      {/* Header section: Business Post Name */}
      <div className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center gap-2">
          <Building2 size={20} className="text-gray-700" />
          <h1 className="font-bold text-gray-800">Business Post Name</h1>
        </div>
        
      </div>

      {/* Announcement Section */}
      <div className="rounded-lg border border-amber-400 bg-amber-100 p-3">
        <div className="flex items-center gap-2">
          <Megaphone size={16} className="text-amber-600" />
          <span className="text-xs font-bold uppercase text-amber-600">
            Announcement
          </span>
        </div>
        <p className="mt-1 font-semibold text-orange-800">
          Announcement Name
        </p>
      </div>
      
      {/* Special Offer Section */}
      <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3">
        {/* <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket size={16} className="text-red-600" />
            <span className="text-xs font-bold uppercase text-red-600">
              Special Offer
            </span>
          </div>
          <div className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
            10% OFF
          </div>
        </div> */}
        <div className="mt-2">
          <p className="font-bold text-gray-800">No Title or test</p>
          <p className="mt-1 text-sm text-gray-600">Test description</p>
          
          {/* View Details Button */}
          <div className="mt-3 flex justify-end">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(true);
              }}
              className="rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:opacity-90 transition-opacity"
            >
              VIEW DETAILS
            </button>
          </div>
        </div>
      </div>
      
      {/* Business Details Modal */}
      {showDetails && post && (
        <ProductServiceDetails 
          post={post} 
          onClose={() => setShowDetails(false)} 
        />
      )}
    </div>
  );
};

export default BusinessPostCard;