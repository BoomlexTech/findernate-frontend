// components/YogaSessionCard.jsx

import { MapPin, Clock, User, Bell, IndianRupee } from 'lucide-react';
import { useState } from 'react';
import ProductServiceDetails from '../ProductServiceDetails';
import { FeedPost } from '@/types';

interface ServiceCardProps {
  post?: FeedPost;
}

const ServiceCard = ({ post }: ServiceCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Extract service data from post customization
  const serviceData = post?.customization?.service;
  const serviceName = serviceData?.name || 'Service';
  const servicePrice = serviceData?.price || 0;
  const serviceCurrency = serviceData?.currency || 'INR';
  const serviceDuration = serviceData?.duration || 60;
  const serviceCategory = serviceData?.category || 'General';
  const serviceLocation = post?.location || 'Location not specified';
  
  return (
    // Main card container
    <div className="w-full rounded-xl bg-blue-100 p-4 shadow-md font-sans border border-blue-500">
      
      {/* Top section: Service Name */}
      <div className="flex items-center gap-3 rounded-lg bg-blue-300 p-2 text-blue-800 border-1 border-blue-600">
        <Bell size={18} />
        <h1 className="text-md font-medium ">{serviceName}</h1>
      </div>

      {/* Middle section: Location & Price */}
      <div className="mt-3 rounded-lg bg-gradient-to-r from-green-100 to-green-200 p-2 border-1 border-green-600">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-green-700" />
            <span className="text-xs font-semibold text-green-800">LOCATION</span>
          </div>
          <span className="text-sm font-semibold text-gray-800">
            {typeof serviceLocation === 'string' ? serviceLocation : serviceLocation?.name || 'Not specified'}
          </span>
        </div>
        <div className="mt-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <IndianRupee size={16} className="text-green-700" />
            <span className="text-xs font-semibold text-green-800">PRICE</span>
          </div>
          <span className=" text-xs font-bold text-gray-900">{serviceCurrency} {servicePrice}</span>
        </div>
      </div>

      {/* Bottom section: Duration & Category */}
      <div className="mt-4 flex items-center gap-6 px-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span className='text-xs'>{serviceDuration} min</span>
        </div>
        <div className="flex items-center gap-2">
          <User size={16} />
          <span className='text-xs'>{serviceCategory}</span>
        </div>
      </div>
      
      {/* Book Now Button */}
      <div className="mt-3 px-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(true);
          }}
          className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:opacity-90"
        >
          BOOK NOW
        </button>
      </div>
      
      {/* Service Details Modal */}
      {showDetails && post && (
        <ProductServiceDetails 
          post={post} 
          onClose={() => setShowDetails(false)} 
        />
      )}
    </div>
  );
};

export default ServiceCard;