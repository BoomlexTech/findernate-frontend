'use client';

import { 
  MapPin, 
  Clock, 
  User, 
  IndianRupee, 
  Calendar, 
  Star, 
  Package, 
  CheckCircle,
  Globe,
  Users,
  Shield,
  // ArrowLeft,
  X,
  Building2
} from 'lucide-react';
import { FeedPost } from '@/types';
import { Badge } from './ui/badge';
import { useState } from 'react';

interface ProductServiceDetailsProps {
  post: FeedPost;
  onClose: () => void;
  isSidebar?: boolean;
}

const ProductServiceDetails = ({ post, onClose, isSidebar = false }: ProductServiceDetailsProps) => {
  const [isBooking, setIsBooking] = useState(false);

  // Mock data - replace with actual post data when available
  const mockProductData = {
    name: post.customization?.product?.name || post.caption || "Premium Product",
    price: "₹1,299",
    duration: "Immediate",
    category: "Electronics",
    type: "Physical",
    location: (typeof post.location === 'string' ? post.location : post.location?.name) || "Delhi, India",
    timing: "9 AM - 9 PM",
    availability: "In Stock",
    requirements: ["Valid ID", "Payment confirmation"],
    whatYouGet: ["Product warranty", "Free shipping", "24/7 support"],
    inStock: true,
    link: "#"
  };

  const mockServiceData = {
    name: post.customization?.service?.name || post.caption || "Professional Service",
    price: "₹500/hour",
    duration: "60 minutes",
    category: "Health & Wellness",
    type: "In-person",
    location: (typeof post.location === 'string' ? post.location : post.location?.name) || "Delhi, India", 
    timing: "10 AM - 6 PM",
    availability: "Available",
    requirements: ["Advance booking", "Valid ID"],
    whatYouGet: ["Professional consultation", "Certificate", "Follow-up support"],
    serviceType: "in-person",
    link: "#"
  };

  const mockBusinessData = {
    name: post.customization?.business?.businessName || post.caption || "Local Business",
    price: "Contact for pricing",
    duration: "Business hours",
    category: "Food & Dining",
    type: "Physical Location",
    location: (typeof post.location === 'string' ? post.location : post.location?.name) || "Delhi, India",
    timing: "9 AM - 10 PM",
    availability: "Open",
    requirements: ["No special requirements"],
    whatYouGet: ["Quality service", "Customer support", "Satisfaction guarantee"],
    businessType: "Restaurant",
    link: "#"
  };

  const isProduct = post.contentType === 'product';
  const isBusiness = post.contentType === 'business';
  const data = isProduct ? mockProductData : isBusiness ? mockBusinessData : mockServiceData;

  const handleBooking = () => {
    setIsBooking(true);
    // Simulate booking process
    setTimeout(() => {
      setIsBooking(false);
      if (isProduct) {
        alert('Product added to cart!');
      } else if (isBusiness) {
        alert('Contact information shared!');
      } else {
        alert('Service booking request sent!');
      }
    }, 2000);
  };

  if (isSidebar) {
    return (
      <div className="bg-white h-full overflow-y-auto hide-scrollbar border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isProduct ? (
                  <Package className="w-6 h-6 text-yellow-600" />
                ) : isBusiness ? (
                  <Building2 className="w-6 h-6 text-yellow-600" />
                ) : (
                  <User className="w-6 h-6 text-yellow-600" />
                )}
                <h2 className="text-xl font-bold text-gray-900">{data.name}</h2>
              </div>
            </div>
            <Badge 
              className="bg-yellow-100 text-yellow-800 border-yellow-200 px-3 py-1"
              variant="outline"
            >
              {isProduct ? 'Product' : isBusiness ? 'Business' : 'Service'}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Price and Duration */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-semibold text-yellow-800 uppercase">Price</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{data.price}</p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-800 uppercase">Duration</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{data.duration}</p>
            </div>
          </div>

          {/* Category and Type */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-semibold text-gray-700 uppercase">Category</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{data.category}</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                {isProduct ? (
                  <Package className="w-4 h-4 text-yellow-600" />
                ) : data.type === 'In-person' ? (
                  <Users className="w-4 h-4 text-orange-600" />
                ) : (
                  <Globe className="w-4 h-4 text-blue-600" />
                )}
                <span className="text-xs font-semibold text-gray-700 uppercase">Type</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{data.type}</p>
            </div>
          </div>

          {/* Location */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-semibold text-orange-800 uppercase">Location</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{data.location}</p>
          </div>

          {/* Timing and Availability */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-indigo-800 uppercase">Timing</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{data.timing}</p>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-800 uppercase">Availability</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{data.availability}</p>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-semibold text-yellow-800 uppercase">Requirements</span>
            </div>
            <ul className="space-y-1">
              {data.requirements.map((req: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-yellow-600" />
                  <span className="text-xs text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What You Get */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-semibold text-teal-800 uppercase">What You Get</span>
            </div>
            <ul className="space-y-1">
              {data.whatYouGet.map((item: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-teal-600" />
                  <span className="text-xs text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Book Button */}
          <div className="pt-2">
            <button
              onClick={handleBooking}
              disabled={isBooking}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white text-sm transition-all duration-200 shadow-lg hover:shadow-xl ${
                isProduct
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                  : isBusiness
                  ? 'bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              } ${isBooking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
            >
              {isBooking ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {isProduct ? 'Adding...' : isBusiness ? 'Getting...' : 'Booking...'}
                </div>
              ) : (
                isProduct ? 'Add to Cart' : isBusiness ? 'Get Contact' : 'Book Now'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Close modal if clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
        // Prevent event bubbling
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-gray-200 p-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isProduct ? (
                  <Package className="w-6 h-6 text-yellow-600" />
                ) : isBusiness ? (
                  <Building2 className="w-6 h-6 text-yellow-600" />
                ) : (
                  <User className="w-6 h-6 text-yellow-600" />
                )}
                <h2 className="text-xl font-bold text-gray-900">{data.name}</h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                className="bg-yellow-100 text-yellow-800 border-yellow-200 px-3 py-1"
                variant="outline"
              >
                {isProduct ? 'Product' : isBusiness ? 'Business' : 'Service'}
              </Badge>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Price and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-800 uppercase">Price</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{data.price}</p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800 uppercase">Duration</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{data.duration}</p>
            </div>
          </div>

          {/* Category and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-semibold text-gray-700 uppercase">Category</span>
              </div>
              <p className="text-lg font-medium text-gray-900">{data.category}</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                {isProduct ? (
                  <Package className="w-5 h-5 text-yellow-600" />
                ) : data.type === 'In-person' ? (
                  <Users className="w-5 h-5 text-orange-600" />
                ) : (
                  <Globe className="w-5 h-5 text-blue-600" />
                )}
                <span className="text-sm font-semibold text-gray-700 uppercase">Type</span>
              </div>
              <p className="text-lg font-medium text-gray-900">{data.type}</p>
            </div>
          </div>

          {/* Location */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-semibold text-orange-800 uppercase">Location</span>
            </div>
            <p className="text-lg font-medium text-gray-900">{data.location}</p>
          </div>

          {/* Timing and Availability */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-800 uppercase">Timing</span>
              </div>
              <p className="text-lg font-medium text-gray-900">{data.timing}</p>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800 uppercase">Availability</span>
              </div>
              <p className="text-lg font-medium text-gray-900">{data.availability}</p>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-800 uppercase">Requirements</span>
            </div>
            <ul className="space-y-2">
              {data.requirements.map((req: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What You Get */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-semibold text-teal-800 uppercase">What You Get</span>
            </div>
            <ul className="space-y-2">
              {data.whatYouGet.map((item: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Book Button */}
          <div className="pt-4">
            <button
              onClick={handleBooking}
              disabled={isBooking}
              className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                isProduct
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                  : isBusiness
                  ? 'bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              } ${isBooking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
            >
              {isBooking ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {isProduct ? 'Adding to Cart...' : isBusiness ? 'Getting Contact Info...' : 'Booking...'}
                </div>
              ) : (
                isProduct ? 'Add to Cart' : isBusiness ? 'Get Contact Info' : 'Book Now'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductServiceDetails;