import React, { useState, useEffect } from 'react';
import type { AxiosError } from 'axios';
import PlanSelectionModal from './business/PlanSelectionModal';
import BusinessDetailsModal from './business/BusinessDetailsModal';
import BusinessVerificationModal from './business/BusinessVerificationModal';
import { PaymentMethodsModal } from './business/PaymentMethodModal';
import FollowRequestManager from './FollowRequestManager';
import { ChevronDown } from 'lucide-react';
import { UpdateBusinessCategory, GetBusinessCategory, switchToBusiness, switchToPersonal, toggleProductPosts, toggleServicePosts } from '@/api/business';
import { useUserStore } from '@/store/useUserStore';
import { getUserProfile } from '@/api/user';

const businessCategories = [
  'Technology & Software',
  'E-commerce & Retail',
  'Health & Wellness',
  'Education & Training',
  'Finance & Accounting',
  'Marketing & Advertising',
  'Real Estate',
  'Travel & Hospitality',
  'Food & Beverage',
  'Fashion & Apparel',
  'Automotive',
  'Construction & Engineering',
  'Legal & Consulting',
  'Entertainment & Media',
  'Art & Design',
  'Logistics & Transportation',
  'Agriculture & Farming',
  'Manufacturing & Industrial',
  'Non-profit & NGOs',
  'Telecommunications'
];

export default function AccountSettings() {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showBusinessDetailsModal, setShowBusinessDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isBusiness, setIsBusiness] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [showBusinessOptions, setShowBusinessOptions] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [servicePostsAllowed, setServicePostsAllowed] = useState(false);
  const [productPostsAllowed, setProductPostsAllowed] = useState(false);
  const [togglingService, setTogglingService] = useState(false);
  const [togglingProduct, setTogglingProduct] = useState(false);
  const { user, updateUser } = useUserStore();

  // Keep local flag in sync with store
  useEffect(() => {
    setIsBusiness(Boolean(user?.isBusinessProfile));
  }, [user?.isBusinessProfile]);

  // Hydrate from backend to avoid stale store values
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getUserProfile();
        const profile = data?.userId ?? data;
        const flag = Boolean(profile?.isBusinessProfile);
        if (isMounted) {
          setIsBusiness(flag);
          updateUser({ 
            isBusinessProfile: flag,
            productEnabled: typeof profile?.productEnabled !== 'undefined' ? Boolean(profile.productEnabled) : undefined,
            serviceEnabled: typeof profile?.serviceEnabled !== 'undefined' ? Boolean(profile.serviceEnabled) : undefined,
          });
          // Initialize toggles from profile fields if available
          if (typeof profile?.serviceEnabled !== 'undefined') {
            setServicePostsAllowed(Boolean(profile.serviceEnabled));
          }
          if (typeof profile?.productEnabled !== 'undefined') {
            setProductPostsAllowed(Boolean(profile.productEnabled));
          }
        }
      } catch {
        // ignore; fallback to store value
      }
    })();
    return () => { isMounted = false; };
  }, [updateUser]);

  // Fetch current business category on component mount
  useEffect(() => {
    const fetchBusinessCategory = async () => {
      if (!isBusiness) {
        setIsLoadingCategory(false);
        return;
      }

      try {
        const response = await GetBusinessCategory();
        setCurrentCategory(response.data?.category || '');
      } catch (error: any) {
        console.error('Failed to fetch business category:', error);
        setCurrentCategory('');
      } finally {
        setIsLoadingCategory(false);
      }
    };

    fetchBusinessCategory();
  }, [isBusiness]);

  const handleCategoryUpdate = async (category: string) => {
    try {
      setIsUpdatingCategory(true);
      setUpdateMessage('Updating category...');
      
      await UpdateBusinessCategory(category);
      setCurrentCategory(category);
      setUpdateMessage('Category updated successfully!');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error: unknown) {
      console.error('Failed to update category:', error);
      
      // Check if it's a 404 error (business profile not found)
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response?.status === 404) {
        setUpdateMessage('Business profile not found. Please add your business details first.');
        setTimeout(() => {
          setUpdateMessage('');
          setShowBusinessDetailsModal(true); // Open the business details modal
        }, 1000);
      } else {
        setUpdateMessage(axiosError.response?.data?.message || 'Failed to update category');
        setTimeout(() => setUpdateMessage(''), 5000);
      }
    } finally {
      setIsUpdatingCategory(false);
      setShowCategoryDropdown(false); // Close the dropdown
    }
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    setShowPlanModal(false);
    if (plan === "Small Business" || plan === "Corporate") {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };



  const handleBusinessDetailsSubmit = async () => {
    setShowBusinessDetailsModal(false);
    setIsBusiness(true);
    try { updateUser({ isBusinessProfile: true }); } catch {}
    setUpdateMessage('Business account created successfully! You can now update your business category.');
    
    // Refresh the business category after creating the profile
    try {
      const response = await GetBusinessCategory();
      setCurrentCategory(response.data?.category || '');
    } catch {
      //console.log('Note: Business category not set yet, but profile created successfully');
    }
    
    setTimeout(() => setUpdateMessage(''), 5000);
  };

  // Switch to business account
  const handleSwitchToBusiness = async () => {
    if (!isBusiness) {
    try {
        setIsSwitching(true);
        setUpdateMessage('Switching to business account...');
      await switchToBusiness();
        
        // Update local state
        setIsBusiness(true);
        
        // Update user store
        updateUser({ isBusinessProfile: true });
        
        setUpdateMessage('Successfully switched to business account!');
        setTimeout(() => setUpdateMessage(''), 3000);
        
        //console.log('Switch to business response:', response);
      } catch (error: unknown) {
        console.error('Failed to switch to business:', error);
        const axiosError = error as AxiosError<{ message?: string }>;
        const errMsg = axiosError.response?.data?.message || 'Failed to switch to business account';
        setUpdateMessage(errMsg);
        setTimeout(() => setUpdateMessage(''), 5000);
      } finally {
        setIsSwitching(false);
      }
    }
  };

  // Switch to personal account
  const handleSwitchToPersonal = async () => {
    if (isBusiness) {
    try {
        setIsSwitching(true);
        setUpdateMessage('Switching to personal account...');
        await switchToPersonal();
        
        // Update local state
        setIsBusiness(false);
        
        // Update user store
        updateUser({ isBusinessProfile: false });
        
        setUpdateMessage('Successfully switched to personal account!');
        setTimeout(() => setUpdateMessage(''), 3000);
        
        // Hide business options when switching to personal
        setShowBusinessOptions(false);
        
        //console.log('Switch to personal response:', response);
      } catch (error: unknown) {
        console.error('Failed to switch to personal:', error);
        const axiosError = error as AxiosError<{ message?: string }>;
        const errMsg = axiosError.response?.data?.message || 'Failed to switch to personal account';
        setUpdateMessage(errMsg);
        setTimeout(() => setUpdateMessage(''), 5000);
      } finally {
        setIsSwitching(false);
      }
    }
  };

  // Posts allowed toggles
  const handleToggleServicePosts = async () => {
    if (!isBusiness || togglingService) return;
    const previous = servicePostsAllowed;
    try {
      setTogglingService(true);
      setServicePostsAllowed(!previous);
      const response = await toggleServicePosts();
      // If backend returns a canonical value, try to honor it
      const backendValue = Boolean(response?.data?.servicePostsAllowed ?? response?.servicePostsAllowed ?? !previous);
      setServicePostsAllowed(backendValue);
      try { updateUser({ serviceEnabled: backendValue }); } catch {}
    } catch (error: unknown) {
      setServicePostsAllowed(previous);
      const axiosError = error as AxiosError<{ message?: string }>;
      const errMsg = axiosError.response?.data?.message || 'Failed to toggle service posts';
      setUpdateMessage(errMsg);
      setTimeout(() => setUpdateMessage(''), 4000);
    } finally {
      setTogglingService(false);
    }
  };

  const handleToggleProductPosts = async () => {
    if (!isBusiness || togglingProduct) return;
    const previous = productPostsAllowed;
    try {
      setTogglingProduct(true);
      setProductPostsAllowed(!previous);
      const response = await toggleProductPosts();
      const backendValue = Boolean(response?.data?.productPostsAllowed ?? response?.productPostsAllowed ?? !previous);
      setProductPostsAllowed(backendValue);
      try { updateUser({ productEnabled: backendValue }); } catch {}
    } catch (error: unknown) {
      setProductPostsAllowed(previous);
      const axiosError = error as AxiosError<{ message?: string }>;
      const errMsg = axiosError.response?.data?.message || 'Failed to toggle product posts';
      setUpdateMessage(errMsg);
      setTimeout(() => setUpdateMessage(''), 4000);
    } finally {
      setTogglingProduct(false);
    }
  };

  return (
    <div className="w-full mx-auto p-4 sm:p-6 bg-white">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-black">Account Settings</h1>
        {isBusiness && showBusinessOptions && (
          <button
            onClick={() => setShowBusinessOptions(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Collapse business options"
          >
            <ChevronDown className="w-4 h-4 rotate-180" />
            <span className="hidden sm:inline">Collapse</span>
          </button>
        )}
      </div>
      
      {/* Success Message */}
      {updateMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{updateMessage}</p>
        </div>
      )}

      
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{isBusiness ? 'Business Account' : 'Personal Account'}</h2>
            {isBusiness ? (
              <div className="flex items-center gap-2 text-gray-700">
                <button
                  type="button"
                  onClick={() => setShowBusinessOptions(!showBusinessOptions)}
                  className="inline-flex items-center gap-1 text-sm sm:text-base hover:text-gray-900"
                >
                  <span>Manage Business</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showBusinessOptions ? 'rotate-180' : ''}`} />
                </button>
              </div>
            ) : (
              <p className="text-sm sm:text-base text-gray-600">Switch to business account</p>
            )}
          </div>
          <button
            className={`px-4 sm:px-6 py-2 md:mr-4 lg:mr-6 cursor-pointer rounded-lg transition-colors bg-yellow-600 text-white hover:bg-yellow-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base md:w-56 lg:w-56`}
            onClick={() => {
              if (!isBusiness) {
                handleSwitchToBusiness();
              } else {
                handleSwitchToPersonal();
              }
            }}
            disabled={isSwitching}
          >
            {isSwitching ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">Switching...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">{isBusiness ? 'Switch to Personal' : 'Switch to Business'}</span>
                <span className="sm:hidden">{isBusiness ? 'Switch to Personal' : 'Switch to Business'}</span>
              </>
            )}
          </button>
        </div>
      </div>

             {/* Business Category Section */}
        {isBusiness && showBusinessOptions && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-blue-50 rounded-lg border border-blue-100">
            <div>
                             <div className="flex items-center justify-between mb-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Business Category</h3>
                <div className="relative">
                  <button 
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    disabled={isUpdatingCategory}
                    className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base md:w-56 lg:w-56"
                  >
                    <span className="hidden sm:inline">{isUpdatingCategory ? 'Updating...' : 'Update Category'}</span>
                    <span className="sm:hidden">{isUpdatingCategory ? 'Updating...' : 'Update'}</span>
                    {isUpdatingCategory ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  {showCategoryDropdown && (
                    <div className="absolute right-0 mt-2 w-48 sm:w-64 bg-white border border-gray-300 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                      {businessCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            handleCategoryUpdate(category);
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 hover:text-blue-700 border-b border-gray-200 last:border-b-0 text-gray-800 font-medium transition-colors duration-150 text-sm sm:text-base"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {isLoadingCategory ? (
                <p className="text-sm sm:text-base text-gray-500">Loading category...</p>
              ) : (
                <p className="text-sm sm:text-base text-blue-600">
                  Current category: {currentCategory || 'No category set'}
                </p>
              )}
              {updateMessage && (
                <p className={`text-xs sm:text-sm mt-1 ${updateMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {updateMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Business Details Section */}
        {isBusiness && showBusinessOptions && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-yellow-50 rounded-lg border border-yellow-100">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Business Details</h3>
                <button
                  onClick={() => setShowBusinessDetailsModal(true)}
                  className="px-4 sm:px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base md:w-56 lg:w-56"
                >
                  <span className="hidden sm:inline">Add Business Details</span>
                  <span className="sm:hidden">Add Details</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <p className="text-sm sm:text-base text-gray-700">
                Add your business information, contact details, and other relevant information.
              </p>
            </div>
          </div>
        )}

        {/* Posts Allowed Section - Service/Product Toggles */}
        {isBusiness && showBusinessOptions && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-purple-50 rounded-lg border border-purple-100">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Posts Allowed</h3>
              </div>
              
              <div className="space-y-4">
                {/* Service Toggle */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Service</h4>
                      <p className="text-sm text-gray-500">Allow service-related posts</p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleServicePosts}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                      servicePostsAllowed ? 'bg-purple-600' : 'bg-gray-200'
                    } ${togglingService ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={togglingService}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        servicePostsAllowed ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Product Toggle */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Product</h4>
                      <p className="text-sm text-gray-500">Allow product-related posts</p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleProductPosts}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                      productPostsAllowed ? 'bg-purple-600' : 'bg-gray-200'
                    } ${togglingProduct ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={togglingProduct}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        productPostsAllowed ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {(servicePostsAllowed || productPostsAllowed) && (
                <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                  <p className="text-sm text-purple-700">
                    <span className="font-semibold">Enabled:</span>
                    {servicePostsAllowed && <span className="ml-1">Service posts</span>}
                    {servicePostsAllowed && productPostsAllowed && <span className="mx-1">•</span>}
                    {productPostsAllowed && <span className="ml-1">Product posts</span>}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

       {/* Business Verification Section */}
       {isBusiness && showBusinessOptions && (
         <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-green-50 rounded-lg border border-green-100">
           <div>
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                 Business Verification
                 <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                 </svg>
               </h3>
               <button
                 onClick={() => setShowVerificationModal(true)}
                 className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base md:w-56 lg:w-56"
               >
                 <span className="hidden sm:inline">Verify Business</span>
                 <span className="sm:hidden">Verify</span>
               </button>
             </div>
             <p className="text-sm sm:text-base text-gray-700">
               Submit business details and documents to request verification.
             </p>
           </div>
         </div>
       )}

       {/* Subscription Plan Section */}
       {isBusiness && showBusinessOptions && (
         <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-yellow-50 rounded-lg border border-yellow-100">
                       <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  Subscription Plan
                  <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </h3>
                <button
                  onClick={() => setShowPlanModal(true)}
                  className="px-4 sm:px-6 py-2 bg-button-gradient text-black rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base md:w-56 lg:w-56"
                >
                  <span className="hidden sm:inline">Manage Plan</span>
                  <span className="sm:hidden">Manage</span>
                </button>
              </div>
              <p className="text-sm sm:text-base text-gray-700">
                Current plan: {selectedPlan || "Free"}
              </p>
            </div>
         </div>
       )}


       {/* Follow Requests Section - Only show if account is private */}
       {user?.privacy === 'private' && (
         <div className="mb-6 sm:mb-8">
           <FollowRequestManager />
         </div>
       )}

       {/* Plan Selection Modal */}
      <PlanSelectionModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSelectPlan={handlePlanSelect}
        currentPlan={selectedPlan || "Free"}
      />
      
      {/* Payment Modal */}
      <PaymentMethodsModal
        isOpen={showPaymentModal}
        onClose={handlePaymentModalClose}
      />
      
      {/* Business Details Modal */}
      <BusinessDetailsModal
        isOpen={showBusinessDetailsModal}
        onClose={() => setShowBusinessDetailsModal(false)}
        onSubmit={handleBusinessDetailsSubmit}
      />

      {/* Business Verification Modal */}
      <BusinessVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSubmit={() => setShowVerificationModal(false)}
      />
    </div>
  );
}