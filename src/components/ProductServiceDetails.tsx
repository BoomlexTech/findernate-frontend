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
  //Shield,
  // ArrowLeft,
  X,
  Building2,
  Link
} from 'lucide-react';
import Image from 'next/image';
import { FeedPost } from '@/types';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUserStore } from '@/store/useUserStore';
import { messageAPI, Chat } from '@/api/message';
import { useRouter } from 'next/navigation';
import { getOtherUserProfile } from '@/api/user';
import { getCurrencySymbol } from '@/utils/currency';

interface ProductServiceDetailsProps {
  post: FeedPost;
  onClose: () => void;
  isSidebar?: boolean;
  showMedia?: boolean;
}

const ProductServiceDetails = ({ post, onClose, isSidebar = false, showMedia = true }: ProductServiceDetailsProps) => {
  const [isBooking, setIsBooking] = useState(false);
  const [resolvedOwnerId, setResolvedOwnerId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const user = useUserStore(state => state.user);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      setMounted(false);
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    };
  }, []);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Build data from post payload (no static placeholders)
  const formatPrice = (price?: string | number, currency?: string) => {
    const hasPrice = typeof price === 'number' ? true : !!price;
    if (!hasPrice && !currency) return '-';
    if (!hasPrice) return currency || '-';
    const priceStr = typeof price === 'number' ? String(price) : price!;
    if (!currency) return priceStr;
    return `${currency} ${priceStr}`;
  };

  const resolvedLocation = (() => {
    const fromCustomization =
      post.customization?.product?.location?.name ||
      post.customization?.service?.location?.name ||
      post.customization?.business?.location?.name;
    if (fromCustomization && fromCustomization.toLowerCase() !== 'unknown location') return fromCustomization;
    if (typeof post.location === 'string' && post.location.toLowerCase() !== 'unknown location') return post.location;
    if (post.location && typeof post.location === 'object' && post.location.name && post.location.name.toLowerCase() !== 'unknown location') return post.location.name;
    return null; // Return null instead of '-' to hide the section
  })();

  const productData = {
    name: post.customization?.product?.name || post.caption || '-',
    price: formatPrice(post.customization?.product?.price, post.customization?.product?.currency),
    duration: '-',
    category: '-',
    type: 'Product',
    location: resolvedLocation,
    timing: null, // Hide timing for products
    availability: post.customization?.product?.inStock === true ? 'In Stock' : post.customization?.product?.inStock === false ? 'Out of Stock' : null, // Hide if not set
    requirements: [] as string[],
    whatYouGet: [] as string[],
    inStock: !!post.customization?.product?.inStock,
    link: post.customization?.product?.link || '#'
  };

  const serviceData = {
    name: post.customization?.service?.name || post.caption || '-',
    price: formatPrice(post.customization?.service?.price, post.customization?.service?.currency),
    duration: typeof post.customization?.service?.duration === 'number' && !Number.isNaN(post.customization?.service?.duration)
      ? `${post.customization?.service?.duration} min`
      : '-',
    category: post.customization?.service?.category || '-',
    type: post.customization?.service?.serviceType || 'Service',
    location: resolvedLocation,
    timing: '-',
    availability: '-',
    requirements: [] as string[],
    whatYouGet: [] as string[],
    link: post.customization?.service?.link || 'None'
  };


  const businessData = {
    name: post.customization?.business?.businessName || post.caption || '-',
    price: '-',
    duration: '-',
    category: post.customization?.business?.category || '-',
    type: post.customization?.business?.businessType || 'Business',
    location: resolvedLocation,
    timing: null, // Hide timing for businesses
    availability: null, // Hide availability for businesses
    requirements: [] as string[],
    whatYouGet: [] as string[],
    link: '#'
  };

  const isProduct = post.contentType === 'product';
  const isBusiness = post.contentType === 'business';
  const data = isProduct ? productData : isBusiness ? businessData : serviceData;

  // Helper to determine if a data field has a meaningful value
  const hasValue = (v?: any) => {
    if (v === null || v === undefined) return false;
    const s = String(v).trim();
    if (s === '') return false;
    if (s === '-' || s.toLowerCase() === 'none') return false;
    return true;
  };



  const handleGetContact = async () => {
    if (isBooking) return;
    if (!user?._id) {
      router.push('/signin');
      return;
    }

    // Extract post owner's id (object form or string fallback). Add defensive checks & logging.
    let targetUserId: string | undefined | null = resolvedOwnerId;
    try {
      if (!targetUserId && post) {
        const rawUserId: any = (post as any).userId;
        if (typeof rawUserId === 'string') {
          targetUserId = rawUserId;
        } else if (rawUserId && typeof rawUserId === 'object') {
          targetUserId = rawUserId._id;
        }
        // Additional fallback fields sometimes used in feeds
        if (!targetUserId && (post as any).ownerId) targetUserId = (post as any).ownerId;
        if (!targetUserId && (post as any).authorId) targetUserId = (post as any).authorId;
        // If still no id but we have a username, fetch profile
        if (!targetUserId && (post as any).username) {
          try {
            const profile = await getOtherUserProfile((post as any).username);
            if (profile?._id) {
              targetUserId = profile._id;
              setResolvedOwnerId(profile._id); // cache for future clicks
            }
          } catch (fetchErr) {
            console.warn('Failed to fetch owner profile by username:', fetchErr);
          }
        }
      }
    } catch (ex) {
      console.warn('Error extracting target user id from post:', ex);
    }

    if (!targetUserId) {
      console.warn('Post object when failing to get owner id:', post);
      showToastMessage('Unable to identify post owner.');
      return;
    }

    // Validate ObjectId format
    const objectIdRegex = /^[a-fA-F0-9]{24}$/;
    if (!objectIdRegex.test(targetUserId)) {
      console.error('Invalid targetUserId format:', targetUserId);
      showToastMessage('Invalid user ID format.');
      return;
    }

    if (!objectIdRegex.test(user._id)) {
      console.error('Invalid current user ID format:', user._id);
      showToastMessage('Invalid current user ID format.');
      return;
    }

    if (targetUserId === user._id) {
      showToastMessage('Cannot send contact request to yourself');
      return;
    }

    try {
      setIsBooking(true);

      // Create a professional automated message
      const contentType = isProduct ? 'product' : isBusiness ? 'business listing' : 'service';
      const initialMessage = `Hi! I'm interested in your ${contentType}: "${data.name}". Could you please share more details? I'd like to know about availability and next steps. Thank you!`;

      // 1. Check if there's an existing direct chat with this user
      let existingChat: Chat | null = null;
      let chatId: string | null = null;
      
      try {
        const active = await messageAPI.getActiveChats(1, 50); // first page
        existingChat = active.chats.find(c => 
          c.chatType === 'direct' &&
          c.participants.some(p => p && p._id === user._id) &&
          c.participants.some(p => p && p._id === targetUserId)
        ) || null;
      } catch (inner) {
        console.warn('Could not fetch active chats:', inner);
      }

      if (existingChat) {
        // Use existing chat
        chatId = existingChat._id;
      } else {
        // Create new chat
        try {
          const newChatResponse = await messageAPI.createChat([user._id, targetUserId], 'direct');
          chatId = newChatResponse._id;
        } catch (createError: any) {
          console.error('Failed to create chat:', {
            error: createError,
            response: createError?.response?.data,
            status: createError?.response?.status,
            participants: [user._id, targetUserId]
          });
          // Fallback to the original redirect method
          router.push(`/chats?userId=${targetUserId}&message=${encodeURIComponent(initialMessage)}&fromContactInfo=true`);
          return;
        }
      }

      // 2. Automatically send the message to the chat
      if (chatId) {
        try {
          await messageAPI.sendMessage(chatId, initialMessage, 'text');
          
          // Show success message
          showToastMessage('Contact request sent successfully!');
          
          // 3. Redirect to the chat to continue conversation
          router.push(`/chats?chatId=${chatId}`);
        } catch (sendError: any) {
          console.error('Failed to send message:', {
            error: sendError,
            response: sendError?.response?.data,
            status: sendError?.response?.status,
            chatId,
            message: initialMessage
          });
          
          // Show specific error message if available
          const errorMessage = sendError?.response?.data?.message || 'Failed to send message automatically';
          showToastMessage(errorMessage);
          
          // Fallback: redirect with pre-filled message
          router.push(`/chats?chatId=${chatId}&message=${encodeURIComponent(initialMessage)}`);
        }
      }
    } catch (err: any) {
      console.error('Failed to process contact request:', err);
      showToastMessage(err?.response?.data?.message || 'Failed to send contact request. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (isSidebar) {
    return (
      <div className="bg-white h-full flex flex-col border-gray-200">
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300">
            {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-gray-200 p-4 z-10 flex-shrink-0">
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto subtle-scrollbar">
          <div className="p-4 space-y-4 pb-20">
          {/* Price and Duration */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-semibold text-yellow-800 uppercase">Price</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{getCurrencySymbol(post.customization?.service?.currency || post.customization?.product?.currency || '')} {data.price}</p>
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

          {/* Location - Only show if location exists */}
          {data.location && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-semibold text-orange-800 uppercase">Location</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{data.location}</p>
            </div>
          )}

          {/* Service Link - Show for all services */}
          {post.contentType === 'service' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Link className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-800 uppercase">Service Link</span>
              </div>
              {data.link && data.link !== 'None' ? (
                <a 
                  href={data.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {data.link}
                </a>
              ) : (
                <p className="text-sm font-medium text-gray-500">None</p>
              )}
            </div>
          )}
          
                     

          {/* Timing and Availability - Only show for services or if data exists */}
          {(post.contentType === 'service' || data.timing || data.availability) && (
            <div className="grid grid-cols-1 gap-3">
              {data.timing && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-semibold text-indigo-800 uppercase">Timing</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{data.timing}</p>
                </div>
              )}
              
              {data.availability && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-800 uppercase">Availability</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{data.availability}</p>
                </div>
              )}
            </div>
          )}

          {/**
           * Requirements (temporarily hidden)
           * <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
           *   <div className="flex items-center gap-2 mb-2">
           *     <Shield className="w-4 h-4 text-yellow-600" />
           *     <span className="text-xs font-semibold text-yellow-800 uppercase">Requirements</span>
           *   </div>
           *   <ul className="space-y-1">
           *     {data.requirements.map((req: string, index: number) => (
           *       <li key={index} className="flex items-center gap-2">
           *         <CheckCircle className="w-3 h-3 text-yellow-600" />
           *         <span className="text-xs text-gray-700">{req}</span>
           *       </li>
           *     ))}
           *   </ul>
           * </div>
           */}

          {/**
           * What You Get (temporarily hidden)
           * <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
           *   <div className="flex items-center gap-2 mb-2">
           *     <Star className="w-4 h-4 text-teal-600" />
           *     <span className="text-xs font-semibold text-teal-800 uppercase">What You Get</span>
           *   </div>
           *   <ul className="space-y-1">
           *     {data.whatYouGet.map((item: string, index: number) => (
           *       <li key={index} className="flex items-center gap-2">
           *         <CheckCircle className="w-3 h-3 text-teal-600" />
           *         <span className="text-xs text-gray-700">{item}</span>
           *       </li>
           *     ))}
           *   </ul>
           * </div>
           */}

          </div>
        </div>

        {/* Sticky Button at Bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 z-10 flex-shrink-0">
          <button
            onClick={handleGetContact}
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
                  Opening Chat...
                </div>
              ) : (
             'Get Contact info' 
            )}
          </button>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return null;
  }

  const modalContent = (
    <div 
  className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => {
        // Close modal if clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
        // Prevent event bubbling
        e.stopPropagation();
      }}
    >
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-[60] bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-6 py-3 rounded-xl shadow-2xl transition-all duration-300 border border-yellow-400">
          {toastMessage}
        </div>
      )}

      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-yellow-200 mx-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (soft, compact) */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-b border-yellow-200 p-4 z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 border border-yellow-200">
                {isProduct ? (
                  <Package className="w-5 h-5 text-yellow-700" />
                ) : isBusiness ? (
                  <Building2 className="w-5 h-5 text-yellow-700" />
                ) : (
                  <User className="w-5 h-5 text-yellow-700" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 truncate">{data.name}</h2>
                <p className="text-xs text-yellow-700 font-medium">{isProduct ? 'Product' : isBusiness ? 'Business' : 'Service'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-yellow-100 rounded-xl transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-yellow-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto subtle-scrollbar">
          {/* Media Section - Show post media if available */}
          {showMedia && post.media && post.media.length > 0 && (
            <div className="p-6 pb-0">
              <div className="relative rounded-xl overflow-hidden bg-gray-50">
                {post.media[0].type === 'video' ? (
                  <video
                    className="w-full max-h-[60vh] object-contain bg-black"
                    controls
                    poster={post.media[0].thumbnailUrl}
                    preload="metadata"
                  >
                    <source src={post.media[0].url} type="video/mp4" />
                  </video>
                ) : (
                  <div className="w-full flex items-center justify-center bg-gray-50">
                    <Image
                      src={post.media[0].url}
                      alt={data.name}
                      width={800}
                      height={800}
                      className="max-h-[60vh] object-contain"
                      unoptimized
                    />
                  </div>
                )}
                {post.media.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
                    1 / {post.media.length}
                  </div>
                )}
              </div>
            </div>
          )}

            <div className="p-6 space-y-6">
              {/* Price and Duration (soft cards) - only show when data present */}
              {(hasValue(data.price) || hasValue(data.duration)) && (
                <div className="grid grid-cols-2 gap-4">
                  {hasValue(data.price) && (
                    <div className="bg-white border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <IndianRupee className="w-5 h-5 text-amber-600" />
                        <span className="text-xs text-gray-600">Price</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{getCurrencySymbol(post.customization?.service?.currency || post.customization?.product?.currency || '')} {data.price}</p>
                    </div>
                  )}

                  {hasValue(data.duration) && (
                    <div className="bg-white border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-xs text-gray-600">Duration</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{data.duration}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Category and Type */}
              {/* Category and Type - only show when values exist */}
              {(hasValue(data.category) || hasValue(data.type)) && (
                <div className="grid grid-cols-2 gap-4">
                  {hasValue(data.category) && (
                    <div className="bg-white border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Star className="w-5 h-5 text-purple-600" />
                        <span className="text-xs text-gray-600">Category</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{data.category}</p>
                    </div>
                  )}

                  {hasValue(data.type) && (
                    <div className="bg-white border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        {isProduct ? (
                          <Package className="w-5 h-5 text-emerald-600" />
                        ) : data.type === 'In-person' ? (
                          <Users className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Globe className="w-5 h-5 text-emerald-600" />
                        )}
                        <span className="text-xs text-gray-600">Type</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{data.type}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Location - Only show if location exists */}
              {hasValue(data.location) && (
                <div className="bg-white border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <span className="text-xs text-gray-600">Location</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{data.location}</p>
                </div>
              )}

              {/* Service Link - Show for all services */}
              {post.contentType === 'service' && hasValue(data.link) && (
                <div className="bg-white border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Link className="w-5 h-5 text-cyan-600" />
                    <span className="text-xs text-gray-600">Service Link</span>
                  </div>
                  <a
                    href={data.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {data.link}
                  </a>
                </div>
              )}
          
          

              {/* Timing and Availability - Only show for services or if data exists */}
              {(hasValue(data.timing) || hasValue(data.availability)) && (
                <div className="grid grid-cols-2 gap-6">
                  {hasValue(data.timing) && (
                    <div className="bg-white border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <span className="text-xs text-gray-600">Timing</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{data.timing}</p>
                    </div>
                  )}

                  {hasValue(data.availability) && (
                    <div className="bg-white border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs text-gray-600">Availability</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{data.availability}</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/**
           * Requirements (temporarily hidden)
           * <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
           *   <div className="flex items-center gap-2 mb-3">
           *     <Shield className="w-5 h-5 text-yellow-600" />
           *     <span className="text-sm font-semibold text-yellow-800 uppercase">Requirements</span>
           *   </div>
           *   <ul className="space-y-2">
           *     {data.requirements.map((req: string, index: number) => (
           *       <li key={index} className="flex items-center gap-2">
           *         <CheckCircle className="w-4 h-4 text-yellow-600" />
           *         <span className="text-gray-700">{req}</span>
           *       </li>
           *     ))}
           *   </ul>
           * </div>
           */}

          {/**
           * What You Get (temporarily hidden)
           * <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
           *   <div className="flex items-center gap-2 mb-3">
           *     <Star className="w-5 h-5 text-teal-600" />
           *     <span className="text-sm font-semibold text-teal-800 uppercase">What You Get</span>
           *   </div>
           *   <ul className="space-y-2">
           *     {data.whatYouGet.map((item: string, index: number) => (
           *       <li key={index} className="flex items-center gap-2">
           *         <CheckCircle className="w-4 h-4 text-teal-600" />
           *         <span className="text-gray-700">{item}</span>
           *       </li>
           *     ))}
           *   </ul>
           * </div>
           */}

        {/* Footer CTA */}
        <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 rounded-b-3xl">
          <div className="flex gap-4">
            {/* Visit Business Button */}
            <button
              onClick={() => {
                const username = (post as any).username;
                if (username) {
                  router.push(`/userprofile/${username}`);
                }
              }}
              className="flex-1 py-4 px-6 rounded-2xl font-bold text-gray-700 text-lg transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-gray-300 hover:border-yellow-400 bg-white hover:bg-yellow-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center justify-center gap-3">
                <User className="w-5 h-5" />
                <span>Visit Business</span>
              </div>
            </button>

            {/* Get Contact Info Button */}
            <button
              onClick={handleGetContact}
              disabled={isBooking}
              className={`group relative flex-1 py-4 px-6 rounded-2xl font-bold text-white text-lg transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden ${
                isProduct
                  ? 'bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-600 hover:from-yellow-600 hover:via-yellow-700 hover:to-amber-700'
                  : isBusiness
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-600 to-yellow-700 hover:from-amber-600 hover:via-yellow-700 hover:to-yellow-800'
                  : 'bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 hover:from-yellow-700 hover:via-amber-700 hover:to-orange-700'
              } ${isBooking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="relative flex items-center justify-center gap-3">
                {isBooking ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span>Opening Chat...</span>
                  </>
                ) : (
                  <>
                    <span>Get Contact Info</span>
                    <div className="group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </div>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProductServiceDetails;