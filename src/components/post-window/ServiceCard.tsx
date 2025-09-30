import { MapPin, Wrench, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import ProductServiceDetails from '../ProductServiceDetails';
import { FeedPost } from '@/types';
import { shouldShowLocation, getLocationDisplayName } from '@/utils/locationUtils';
import { getCurrencySymbol } from '@/utils/currency';

interface ServiceCardProps {
  post?: FeedPost;
}

const ServiceCard = ({ post }: ServiceCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Extract service data from post customization
  const serviceData = post?.customization?.service;
  const serviceName = serviceData?.name || post?.caption || 'Service';
  const servicePrice = serviceData?.price || 0;
  const serviceCurrency = serviceData?.currency || 'INR';
  const serviceDuration = serviceData?.duration;

  // Truncate service name if longer than 16 characters
  const isLongName = serviceName.length > 16;
  const displayName = isLongName ? serviceName.substring(0, 16) + '...' : serviceName;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-yellow-50 via-white to-yellow-25 p-5 shadow-xl border border-yellow-100 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ring-0 hover:ring-2 hover:ring-yellow-200/40">
      {/* Compact header with subtle icon and title */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-100 to-yellow-50 shadow-inner border border-yellow-200">
          <Wrench size={22} className="text-yellow-600" />
        </div>

        <div className="flex-1">
          <h3 
            className="text-lg font-bold text-gray-900 leading-snug" 
            title={isLongName ? serviceName : undefined}
          >
            {displayName}
          </h3>
        </div>

        <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold shadow-sm">
          Online
        </span>
      </div>

      {/* Small info row */}
      <div className="flex items-center justify-between gap-3 mb-5 text-[15px] text-gray-700">
        {shouldShowLocation(post?.location) ? (
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-emerald-500" />
            <span className="truncate max-w-[160px] font-medium">{getLocationDisplayName(post?.location)}</span>
          </div>
        ) : (
          <div className="text-gray-300">&nbsp;</div>
        )}

        <div className="flex items-center gap-2">
          <span className="font-bold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full shadow-sm text-[15px]">{getCurrencySymbol(serviceCurrency)} {servicePrice.toLocaleString()}</span>
        </div>
      </div>

      {/* CTA Button - softer outline style */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDetails(true);
        }}
        className="w-full rounded-full border border-yellow-100 px-4 py-2 text-[15px] font-semibold text-yellow-700 bg-white hover:bg-yellow-50 hover:shadow-md transition-all flex items-center justify-center gap-2 group"
      >
        <span>View details</span>
        <ArrowRight size={16} className="text-yellow-600 group-hover:translate-x-1 transition-transform duration-200" />
      </button>

      {/* Service Details Modal */}
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

export default ServiceCard;