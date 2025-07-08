import React from 'react';

export default function AccountSettings() {
  return (
    <div className="w-full mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
      
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
          <button className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
            Manage Plan
          </button>
        </div>
      </div>
    </div>
  );
}