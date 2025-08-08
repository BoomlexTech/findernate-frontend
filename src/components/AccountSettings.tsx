import React, { useState, useEffect } from 'react';
import PlanSelectionModal from './business/PlanSelectionModal';
import BusinessDetailsModal from './business/BusinessDetailsModal';
import { ChevronDown } from 'lucide-react';
import { UpdateBusinessCategory, GetBusinessCategory } from '@/api/business';
import { CreateBusinessRequest } from '@/types';
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
  const [isBusiness, setIsBusiness] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
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

  const handleCategorySelect = async (category: string) => {
    if (category === currentCategory) {
      setShowCategoryDropdown(false);
      return;
    }

    setIsUpdatingCategory(true);
    setUpdateMessage('');
    
    try {
      await UpdateBusinessCategory(category);
      setCurrentCategory(category);
      setUpdateMessage('Category updated successfully!');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error: any) {
      setUpdateMessage(error.response?.data?.message || 'Failed to update category');
      setTimeout(() => setUpdateMessage(''), 3000);
    } finally {
      setIsUpdatingCategory(false);
      setShowCategoryDropdown(false);
    }
  };

  const handleBusinessDetailsSubmit = (data: CreateBusinessRequest) => {
    // Handle the business details submission
    console.log('Business details submitted:', data);
    setShowBusinessDetailsModal(false);
    setIsBusiness(true);
    try { updateUser({ isBusinessProfile: true }); } catch {}
    setUpdateMessage('Business account created successfully!');
    setTimeout(() => setUpdateMessage(''), 3000);
  };

  // Upgrade flow only for non-business users
  const handleSwitchToBusiness = () => {
    if (!isBusiness) {
      setShowBusinessDetailsModal(true);
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-black mb-8">Account Settings</h1>
      
      {/* Success Message */}
      {updateMessage && !isBusiness && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{updateMessage}</p>
        </div>
      )}

      {/* Business Account Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Business Account</h2>
            <p className="text-gray-600">
              {isBusiness ? 'You are on a business account' : 'Switch to business account'}
            </p>
          </div>
          {!isBusiness && (
            <button
              className={`px-6 py-2 cursor-pointer rounded-lg transition-colors bg-yellow-600 text-white hover:bg-yellow-700`}
              onClick={handleSwitchToBusiness}
            >
              Switch to Business
            </button>
          )}
        </div>
      </div>

      {/* Business Category Section */}
      {isBusiness && (
        <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Category</h3>
              {isLoadingCategory ? (
                <p className="text-gray-500">Loading category...</p>
              ) : (
                <p className="text-blue-600">
                  Current category: {currentCategory || 'No category set'}
                </p>
              )}
              {updateMessage && (
                <p className={`text-sm mt-1 ${updateMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {updateMessage}
                </p>
              )}
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                disabled={isUpdatingCategory}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingCategory ? 'Updating...' : 'Update Category'}
                {isUpdatingCategory ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                )}
              </button>
              
              {showCategoryDropdown && !isUpdatingCategory && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowCategoryDropdown(false)}
                  />
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                    {businessCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategorySelect(category)}
                        className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          currentCategory === category ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plan Section */}
      {isBusiness && (
        <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div>
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-yellow-800 mr-2">Subscription Plan</h3>
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-yellow-800">Current plan: Small Business</p>
              </div>
            </div>
            <button
              onClick={() => setShowPlanModal(true)}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Manage Plan
            </button>
          </div>
        </div>
      )}

      {/* Plan Selection Modal (reusable) */}
      <PlanSelectionModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSelectPlan={() => {
          setShowPlanModal(false);
        }}
        currentPlan="Small Business" // or whatever the current plan is
      />

      {/* Business Details Modal */}
      <BusinessDetailsModal
        isOpen={showBusinessDetailsModal}
        onClose={() => setShowBusinessDetailsModal(false)}
        onSubmit={handleBusinessDetailsSubmit}
      />
    </div>
  );
}