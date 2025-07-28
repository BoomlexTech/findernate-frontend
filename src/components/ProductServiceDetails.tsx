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
  ArrowLeft
} from 'lucide-react';
import { FeedPost } from '@/types';
import { Badge } from './ui/badge';
import { useState } from 'react';

interface ProductServiceDetailsProps {
  post: FeedPost;
  onClose: () => void;
}

const ProductServiceDetails = ({ post, onClose }: ProductServiceDetailsProps) => {
  const [isBooking, setIsBooking] = useState(false);

  // Mock data - replace with actual post data when available
  const mockProductData = {
    name: post.caption || "Premium Product",
    price: "₹1,299",
    duration: "Immediate",
    category: "Electronics",
    type: "Physical",
    location: post.location?.name || "Delhi, India",
    timing: "9 AM - 9 PM",
    availability: "In Stock",
    requirements: ["Valid ID", "Payment confirmation"],
    whatYouGet: ["Product warranty", "Free shipping", "24/7 support"],
    inStock: true,
    link: "#"
  };

  const mockServiceData = {
    name: post.caption || "Professional Service",
    price: "₹500/hour",
    duration: "60 minutes",
    category: "Health & Wellness",
    type: "In-person",
    location: post.location?.name || "Delhi, India", 
    timing: "10 AM - 6 PM",
    availability: "Available",
    requirements: ["Advance booking", "Valid ID"],
    whatYouGet: ["Professional consultation", "Certificate", "Follow-up support"],
    serviceType: "in-person",
    link: "#"
  };

  const isProduct = post.contentType === 'product';
  const data = isProduct ? mockProductData : mockServiceData;

  const handleBooking = () => {
    setIsBooking(true);
    // Simulate booking process
    setTimeout(() => {
      setIsBooking(false);
      alert(isProduct ? 'Product added to cart!' : 'Service booking request sent!');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                {isProduct ? (
                  <Package className="w-6 h-6 text-purple-600" />
                ) : (
                  <User className="w-6 h-6 text-blue-600" />
                )}
                <h2 className="text-xl font-bold">{data.name}</h2>
              </div>
            </div>
            <Badge 
              className={`${isProduct ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}
              variant="outline"
            >
              {isProduct ? 'Product' : 'Service'}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Price and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-800 uppercase">Price</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{data.price}</p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800 uppercase">Duration</span>
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
                  <Package className="w-5 h-5 text-purple-600" />
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
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
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
              {data.requirements.map((req, index) => (
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
              {data.whatYouGet.map((item, index) => (
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
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              } ${isBooking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
            >
              {isBooking ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {isProduct ? 'Adding to Cart...' : 'Booking...'}
                </div>
              ) : (
                isProduct ? 'Add to Cart' : 'Book Now'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductServiceDetails;