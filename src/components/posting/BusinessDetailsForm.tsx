import React from 'react';
import { BusinessPostFormProps } from '@/types';

const BusinessDetailsForm: React.FC<BusinessPostFormProps> = ({
  formData,
  onChange,
}) => {
  const isActive = ['Active', 'inactive'];

  return (
    <div className="bg-white p-6 rounded-xl shadow mb-6 border-2 border-yellow-500">
      <h3 className="text-lg text-black font-semibold mb-4">Business Details</h3>
      
      {/* Basic Business Information */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name 
          </label>
          <input
            type="text"
            name="businessName"
            placeholder="e.g., Priya Enterprises"
            value={formData.business.businessName}
            onChange={onChange}
            className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Link 
          </label>
          <input
            type="text"
            name="link"
            placeholder="https://yourbusiness.com"
            value={formData.business.link}
            onChange={onChange}
            className="w-full p-3 border text-gray-900 border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Description 
          </label>
          <textarea
            name="description"
            placeholder="Describe your business, services, and what makes you unique..."
            value={formData.business.description}
            onChange={onChange}
            className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Announcement 
          </label>
          <textarea
            name="announcement"
            placeholder="Share any special announcements, updates, or news about your business..."
            value={formData.business.announcement}
            onChange={onChange}
            className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            rows={3}
          />
        </div>
      </div>

      {/* Location Information */}
      <div className="mb-6">
        <h4 className="text-md text-black font-semibold mb-3">Location</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Address 
          </label>
          <input
            type="text"
            name="address"
            placeholder="e.g., 123 Main Street, Mumbai, India"
            value={formData.business?.location?.address || ''}
            onChange={onChange}
            className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
      </div>

      {/* Promotions Section */}
      <div className="mb-6">
        <h4 className="text-md text-black font-semibold mb-3">Promotions (Optional)</h4>
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                placeholder="Enter discount percentage"
                min="0"
                max="100"
                value={(formData.business?.promotions?.[0]?.discount ?? 0).toString()}
                onChange={onChange}
                className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promotion Status
              </label>
              <select
                name="isActive"
                value={(formData.business?.promotions?.[0]?.isActive ? 'Active' : 'inactive')}
                onChange={onChange}
                className='w-full p-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
              >
                {isActive.map((active) => (
                  <option key={active} value={active}>{active}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valid Until
            </label>
            <input
              type="date"
              name="validUntil"
              placeholder="Select expiry date"
              value={formData.business?.promotions?.[0]?.validUntil ?? ''}
              onChange={onChange}
              className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Type
          </label>
          <input
            type="text"
            name="businessType"
            placeholder="e.g., Retail, Service, Restaurant"
            value={formData.business.businessType}
            onChange={onChange}
            className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              name="category"
              placeholder="e.g., Food & Beverage"
              value={formData.business.category}
              onChange={onChange}
              className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategory
            </label>
            <input
              type="text"
              name="subcategory"
              placeholder="e.g., Restaurant"
              value={formData.business.subcategory}
              onChange={onChange}
              className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailsForm;