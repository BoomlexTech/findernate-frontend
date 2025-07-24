// components/YogaSessionCard.jsx

import { MapPin, Clock, User, Bell, IndianRupee } from 'lucide-react';

const ServiceCard = () => {
  return (
    // Main card container
    <div className="max-w-sm rounded-xl bg-blue-100 p-4 shadow-md font-sans border border-blue-500">
      
      {/* Top section: Yoga Session */}
      <div className="flex items-center gap-3 rounded-lg bg-blue-300 p-2 text-blue-800 border-1 border-blue-600">
        <Bell size={18} />
        <h1 className="text-md font-medium ">Yoga Session</h1>
      </div>

      {/* Middle section: Location & Price */}
      <div className="mt-3 rounded-lg bg-gradient-to-r from-green-100 to-green-200 p-2 border-1 border-green-600">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-green-700" />
            <span className="text-xs font-semibold text-green-800">LOCATION</span>
          </div>
          <span className="text-sm font-semibold text-gray-800">Delhi, Delhi</span>
        </div>
        <div className="mt-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <IndianRupee size={16} className="text-green-700" />
            <span className="text-xs font-semibold text-green-800">PRICE</span>
          </div>
          <span className=" text-xs font-bold text-gray-900">INR 500</span>
        </div>
      </div>

      {/* Bottom section: Duration & Type */}
      <div className="mt-4 flex items-center gap-6 px-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span className='text-xs'>60 min</span>
        </div>
        <div className="flex items-center gap-2">
          <User size={16} />
          <span className='text-xs'>in-person</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;