import React, { useState } from 'react';

export default function AccountSettings() {
  const [showPlanModal, setShowPlanModal] = useState(false);

  return (
    <div className="w-full mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-black mb-8">Account Settings</h1>

      {/* Business Account Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Business Account</h2>
            <p className="text-gray-600">Switch back to personal account</p>
          </div>
          <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
            Switch to Personal
          </button>
        </div>
      </div>

      {/* Business Category Section */}
      <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Category</h3>
            <p className="text-blue-600">Current category: Fashion & Apparel</p>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Update Category
          </button>
        </div>
      </div>

      {/* Subscription Plan Section */}
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

      {/* Plan Selection Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-4xl w-full p-8 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setShowPlanModal(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-center text-black mb-6">Choose Your Plan</h2>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <div className="border rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold text-black">Free</h3>
                <p className="text-2xl font-bold my-2 text-black">₹0</p>
                <p className="text-sm text-gray-500 mb-4">/Forever</p>
                <ul className="text-sm text-left space-y-2 mb-6 text-black">
                  <li><span className='text-green-500 text-xl'>✔</span> Basic business profile</li>
                  <li><span className='text-green-500 text-xl'>✔</span> Up to 10 posts per month</li>
                  <li><span className='text-green-500 text-xl'>✔</span> Basic analytics</li>
                  <li><span className='text-green-500 text-xl'>✔</span>Community support</li>
                </ul>
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-default">Current Plan</button>
              </div>

              {/* Small Business Plan */}
              <div className="border-2 border-yellow-400 bg-yellow-50 rounded-lg p-6 text-center relative">
                <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </span>
                <h3 className="text-xl font-semibold text-black">Small Business</h3>
                <p className="text-2xl font-bold my-2 text-black">₹999</p>
                <p className="text-sm text-gray-500 mb-4">/per month</p>
                <ul className="text-sm text-left space-y-2 mb-6 text-black">
                  <li><span className='text-green-500 text-xl'>✔</span> Enhanced business profile</li>
                  <li><span className='text-green-500 text-xl'>✔</span> Unlimited posts</li>
                  <li><span className='text-green-500 text-xl'>✔</span> Advanced analytics</li>
                  <li><span className='text-green-500 text-xl'>✔</span> Product catalog (up to 50 items)</li>
                  <li><span className='text-green-500 text-xl'>✔</span> Priority support</li>
                  <li><span className='text-green-500 text-xl'>✔</span> Basic advertising tools</li>
                </ul>
                <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">
                  Upgrade Now
                </button>
              </div>

              {/* Corporate Plan */}
              <div className="border rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold text-black">Corporate</h3>
                <p className="text-2xl font-bold my-2 text-black">₹2999</p>
                <p className="text-sm text-gray-500 mb-4">/per month</p>
                <ul className="text-sm text-left space-y-2 mb-6 text-black">
                  <li><span className='text-green-500 text-xl'>✔</span> Premium business profile</li>
                  <li><span className='text-green-500 text-xl'>✔</span> Unlimited everything</li>
                  <li><span className='text-green-500 text-xl'>✔</span> Advanced analytics & insights</li>
                  <li><span className='text-green-500 text-xl'>✔</span> Unlimited product catalog</li>
                  <li><span className='text-green-500 text-xl'>✔</span> Dedicated account manager</li>
                  <li><span className='text-green-500 text-xl'>✔</span> Advanced advertising & promotion</li>
                  <li><span className='text-green-500 text-xl'>✔</span> API access</li>
                  <li><span className='text-green-500 text-xl'>✔</span> White-label options</li>
                </ul>
                <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
