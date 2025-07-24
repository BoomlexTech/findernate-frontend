import { ProductDetailsFormProps } from '@/types';
import React from 'react';



const ProductDetailsForm: React.FC<ProductDetailsFormProps> = ({
  formData,
  onChange,
}) => {

  const currency=['INR', 'USD', 'EUR'];

  return (
    <div className="bg-gray-100 p-6 rounded-xl shadow-md mb-6 border-2 border-yellow-500">
      <h3 className="text-lg text-black font-semibold mb-4">Product Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input
            type="text"
            name="name"
            placeholder="e.g., Handcrafted Silk Saree"
            value={formData.product.name}
            onChange={onChange}
            className="w-full p-3 border text-gray-900 border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
          <input
            type="number"
            name="price"
            min="0"
            value={formData.product.price}
            onChange={onChange}
            className="w-full p-3 border text-gray-900 border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
        <select
          name="currency"
          value={formData.product.currency}
          onChange={onChange}
          className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500
            ${formData.product.currency === '' ? 'text-gray-400' : 'text-gray-900'}`} 
          required
        >
          <option value="" disabled>Select category</option>
          {currency.map((curr: string) => (
            <option key={curr} value={curr}>{curr}</option>
          ))}
        </select>
      </div>
         <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Link</label>
          <input
            type="text"
            name="link"
            value={formData.product.link}
            onChange={onChange}
            className="w-full p-3 border text-gray-900 border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="inStock"
          checked={formData.product.inStock}
          onChange={onChange}
          className="mr-2"
        />
        <label className="text-sm text-gray-700">In Stock</label>
      </div>
    </div>
  );
};

export default ProductDetailsForm;
