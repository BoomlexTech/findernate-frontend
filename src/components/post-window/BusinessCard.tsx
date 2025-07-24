// components/BusinessPostCard.jsx

import { Building2, Megaphone, Ticket } from 'lucide-react';

const BusinessPostCard = () => {
  return (
    // Main card container
    <div className="max-w-sm mr-3 rounded-2xl border border-violet-500 bg-violet-200 p-2 shadow-md font-sans">
      
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
        </div>
      </div>
    </div>
  );
};

export default BusinessPostCard;