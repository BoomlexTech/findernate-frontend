// components/BusinessPostCard.jsx

import { Building2, Megaphone, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import ProductServiceDetails from '../ProductServiceDetails';
import { FeedPost } from '@/types';

interface BusinessPostCardProps {
  post?: FeedPost;
}

const BusinessPostCard = ({ post }: BusinessPostCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Extract business data from post customization
  const businessData = post?.customization?.business;
  const businessName = businessData?.businessName || 'Business';
  const businessType = businessData?.businessType || 'General';
  const businessDescription = businessData?.description || post?.description || 'No description available';
  const businessCategory = businessData?.category || 'Business';
  
  return (
    <div className="w-full rounded-xl bg-white p-4 shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow ring-0 hover:ring-1 hover:ring-yellow-50">
      {/* Compact header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50">
          <Building2 size={18} className="text-indigo-600" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-md font-semibold text-gray-900 truncate">{businessName}</h3>
          <p className="text-xs text-gray-500 mt-1">{businessType}</p>
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">{businessCategory}</div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4 text-sm text-gray-600">{businessDescription}</div>

      {/* CTA */}
      <div className="flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(true);
          }}
          className="rounded-full border border-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-50 transition-colors flex items-center gap-2"
        >
          <span>View details</span>
          <ArrowRight size={14} className="text-yellow-600" />
        </button>
      </div>

      {showDetails && post && (
        <ProductServiceDetails
          post={post}
          onClose={() => setShowDetails(false)}
          showMedia={false}
        />
      )}
    </div>
  );
};

export default BusinessPostCard;