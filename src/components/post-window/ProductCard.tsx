// components/ProductCard.jsx

import { MapPin, ShoppingBag, Star } from 'lucide-react';

const ProductCard = () => {
  return (
    // Main card container
    <div className="max-w-sm rounded-2xl border border-violet-500 bg-violet-200 p-2 shadow-lg font-sans">
      
      {/* Top section: Product Name */}
      <div className="flex items-center gap-3 border border-violet-600 rounded-lg bg-violet-300 p-3 text-violet-900">
        <ShoppingBag size={22} className="text-violet-800" />
        <h1 className="text-lg font-lg">Cool T-Shirt</h1>
      </div>

      {/* Bottom section: Details and Shop Now button */}
      <div className="mt-2 rounded-lg border border-orange-500 bg-gradient-to-br from-orange-100 to-amber-50 p-4">
        
        {/* Location Info */}
        <div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-orange-600" />
            <span className="text-xs font-bold uppercase text-orange-600">Location</span>
          </div>
          <p className="mt-1 ml-1 text-sm text-gray-700">
            Connaught Place, Delhi
          </p>
        </div>

        {/* Divider */}
        <hr className="my-3 border-t border-orange-200" />

        {/* New Arrival & Shop Now Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* The fill color makes the star solid */}
            <Star size={18} className="text-orange-500 fill-orange-500" />
            <span className="text-sm font-bold text-orange-600">NEW ARRIVAL</span>
          </div>
          <button className="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-bold text-white shadow-md hover:opacity-90">
            SHOP NOW
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;