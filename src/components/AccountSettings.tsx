import React, { useState, useEffect } from 'react';
import PlanSelectionModal from './business/PlanSelectionModal';
import BusinessDetailsModal from './business/BusinessDetailsModal';
import BusinessVerificationModal from './business/BusinessVerificationModal';
import { PaymentMethodsModal } from './business/PaymentMethodModal';
import { ChevronDown } from 'lucide-react';
import { UpdateBusinessCategory, GetBusinessCategory, switchToBusiness, switchToPersonal } from '@/api/business';
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
          updateUser({ isBusinessProfile: flag });
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
    } catch (error: any) {
      console.error('Failed to update category:', error);
      setUpdateMessage(error.response?.data?.message || 'Failed to update category');
      setTimeout(() => setUpdateMessage(''), 5000);
    } finally {
      setIsUpdatingCategory(false);
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



  const handleBusinessDetailsSubmit = () => {
    setShowBusinessDetailsModal(false);
    setIsBusiness(true);
    try { updateUser({ isBusinessProfile: true }); } catch {}
    setUpdateMessage('Business account created successfully!');
    setTimeout(() => setUpdateMessage(''), 3000);
  };

  // Switch to business account
  const handleSwitchToBusiness = async () => {
    if (!isBusiness) {
      try {
        setIsSwitching(true);
        setUpdateMessage('Switching to business account...');
        const response = await switchToBusiness();
        
        // Update local state
        setIsBusiness(true);
        
        // Update user store
        updateUser({ isBusinessProfile: true });
        
        setUpdateMessage('Successfully switched to business account!');
        setTimeout(() => setUpdateMessage(''), 3000);
        
        console.log('Switch to business response:', response);
      } catch (error: any) {
        console.error('Failed to switch to business:', error);
        setUpdateMessage(error.response?.data?.message || 'Failed to switch to business account');
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
        const response = await switchToPersonal();
        
        // Update local state
        setIsBusiness(false);
        
        // Update user store
        updateUser({ isBusinessProfile: false });
        
        setUpdateMessage('Successfully switched to personal account!');
        setTimeout(() => setUpdateMessage(''), 3000);
        
        // Hide business options when switching to personal
        setShowBusinessOptions(false);
        
        console.log('Switch to personal response:', response);
      } catch (error: any) {
        console.error('Failed to switch to personal:', error);
        setUpdateMessage(error.response?.data?.message || 'Failed to switch to personal account');
        setTimeout(() => setUpdateMessage(''), 5000);
      } finally {
        setIsSwitching(false);
      }
    }
  };

  return (
    <div className="w-full mx-auto p-4 sm:p-6 bg-white">
      <h1 className="text-2xl sm:text-3xl font-bold text-black mb-6 sm:mb-8">Account Settings</h1>
      
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
            <p className="text-sm sm:text-base text-gray-600">
              {isBusiness 
                ? (showBusinessOptions ? 'Manage your business settings' : 'Switch to personal account')
                : 'Switch to business account'
              }
            </p>
          </div>
          <button
            className={`px-4 sm:px-6 py-2 md:mr-4 lg:mr-6 cursor-pointer rounded-lg transition-colors bg-yellow-600 text-white hover:bg-yellow-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base md:w-56 lg:w-56`}
            onClick={() => {
              if (!isBusiness) {
                handleSwitchToBusiness();
              } else if (showBusinessOptions) {
                handleSwitchToPersonal();
              } else {
                setShowBusinessOptions(!showBusinessOptions);
              }
            }}
            disabled={isSwitching}
          >
            {isSwitching ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">{isBusiness ? 'Switching...' : 'Switching...'}</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">
                  {isBusiness && showBusinessOptions ? 'Switch to Personal' : isBusiness ? 'Manage Business' : 'Switch to Business'}
                </span>
                <span className="sm:hidden">
                  {isBusiness && showBusinessOptions ? 'Switch to Personal' : isBusiness ? 'Manage Business' : 'Switch to Business'}
                </span>
                {isBusiness && !showBusinessOptions && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${showBusinessOptions ? 'rotate-180' : ''}`} />
                )}
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
                  className="px-4 sm:px-6 py-2 bg-button-gradient text-white text-shadow rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base md:w-56 lg:w-56"
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