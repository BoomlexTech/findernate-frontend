import React from 'react';
import { BusinessPostFormProps } from '@/types';


const BusinessDetailsForm: React.FC<BusinessPostFormProps> = ({
  formData,
  onChange,
}) => {

  const isActive = ['Active', 'inactive']

  return (
    <div className="bg-gray-100 p-6 rounded-xl shadow mb-6 border-2 border-yellow-500">
      <h3 className="text-lg text-black font-semibold mb-4">Business Details</h3>
      <div className="gap-4 mb-4">
        <div className='mb-3'>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
          <input
            type="text"
            name="businessName"
            placeholder="e.g., Priya Enterprises"
            value={formData.business.businessName}
            onChange={onChange}
            className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>
         <div className='mb-4'>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Link</label>
          <input
            type="text"
            name="link"
            value={formData.business.link}
            onChange={onChange}
            className="w-full p-3 border text-gray-900 border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>
      </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Announcements</label>
          <textarea
            name="announcement"
            placeholder="Write your business announcement..."
            value={formData.business.announcement}
            onChange={onChange}
            className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>

    <h3 className="text-lg text-black font-semibold mb-4">Promotions</h3>
<div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
    <input
      type="text"
      name="address"
      placeholder="e.g., Mumbai, India"
      value={formData.business?.location?.address || ''}
      onChange={onChange}
      className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      required
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
    <textarea
      name="description"
      placeholder="Detailed description..."
      value={formData.business.description}
      onChange={onChange}
      className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      rows={3}
    />
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
      <input
        type="number"
        name="discount"
        placeholder="Enter discount"
        value={(formData.business?.promotions?.[0]?.discount ?? 0).toString()}
        onChange={onChange}
        className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Is Active</label>
      <select
        name="isActive"
        value={(formData.business?.promotions?.[0]?.isActive ? 'Active' : 'inactive')}
        onChange={onChange}
        className='w-full p-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
        required
      >
        {isActive.map((active) => (
          <option key={active} value={active}>{active}</option>
        ))}
      </select>
    </div>
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
    <input
      type="date"
      name="validUntil"
      placeholder="Select expiry date"
      value={formData.business?.promotions?.[0]?.validUntil ?? ''}
      onChange={onChange}
      className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      required
    />
  </div>
</div>


    
    </div>
  );
};

export default BusinessDetailsForm;
