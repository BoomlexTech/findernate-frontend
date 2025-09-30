// components/ProductCard.jsx

import { MapPin, Package, Star, ArrowRight } from 'lucide-react';
import { getCurrencySymbol } from '@/utils/currency';
import { useState } from 'react';
import ProductServiceDetails from '../ProductServiceDetails';
import { FeedPost } from '@/types';
import { shouldShowLocation, getLocationDisplayName } from '@/utils/locationUtils';

interface ProductCardProps {
  post?: FeedPost;
}

const ProductCard = ({ post }: ProductCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Extract product data from post customization
  const productData = post?.customization?.product;
  const productName = productData?.name || post?.caption || 'Product';
  const productPrice = productData?.price || 0;
  const productCurrency = productData?.currency || 'INR';
  const inStock = productData?.inStock !== false; // Default to true if not specified

  // Truncate product name if longer than 16 characters
  const isLongName = productName.length > 16;
  const displayName = isLongName ? productName.substring(0, 16) + '...' : productName;
  
  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-yellow-50 via-white to-yellow-25 p-5 shadow-xl border border-yellow-100 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ring-0 hover:ring-2 hover:ring-yellow-200/40">
      {/* Compact header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-100 to-yellow-50 shadow-inner border border-yellow-200">
          <Package size={22} className="text-yellow-600" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 
            className="text-lg font-bold text-gray-900" 
            title={isLongName ? productName : undefined}
          >
            {displayName}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{inStock ? 'Available' : 'Unavailable'}</p>
        </div>

        <div className="text-right">
          <span className="font-bold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full shadow-sm text-[15px]">{getCurrencySymbol(productCurrency)} {productPrice.toLocaleString()}</span>
        </div>
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
          <Star size={16} className={`${inStock ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>{inStock ? 'In stock' : 'Out'}</span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDetails(true);
        }}
        disabled={!inStock}
        className={`w-full rounded-full border border-yellow-100 px-4 py-2 text-[15px] font-semibold ${inStock ? 'text-yellow-700 bg-white hover:bg-yellow-50 hover:shadow-md' : 'text-gray-400 bg-gray-50 cursor-not-allowed'} transition-all flex items-center justify-center gap-2 group`}
      >
        <span>View details</span>
        <ArrowRight size={16} className={`${inStock ? 'text-yellow-600 group-hover:translate-x-1 transition-transform duration-200' : 'text-gray-400'}`} />
      </button>

      {showDetails && post && (
        <ProductServiceDetails
          post={post}
          onClose={() => setShowDetails(false)}
          showMedia={true}
        />
      )}
    </div>
  );
};

export default ProductCard;