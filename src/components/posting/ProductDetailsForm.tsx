import { ProductDetailsFormProps } from '@/types';
import React, { useState, useEffect } from 'react';
import { getProductPreviousData } from '@/api/serviceAutofill';



const ProductDetailsForm: React.FC<ProductDetailsFormProps> = ({
  formData,
  onChange,
}) => {

  const currency=['INR', 'USD', 'EUR'];
  const [autofillData, setAutofillData] = useState<any>(null);
  const [isLoadingAutofill, setIsLoadingAutofill] = useState(false);

  // Fetch autofill data on component mount
  useEffect(() => {
    const fetchAutofillData = async () => {
      try {
        setIsLoadingAutofill(true);
        const response = await getProductPreviousData();

        console.log('Product Autofill API Response:', response);

        if (response?.data?.autoFillEnabled && response?.data?.data) {
          console.log('Product autofill data available:', response.data.data);
          setAutofillData(response.data.data);
        } else {
          console.log('Product autofill disabled or no previous data');
          setAutofillData(null);
        }
      } catch (error) {
        console.error('Failed to fetch product autofill data:', error);
        setAutofillData(null);
      } finally {
        setIsLoadingAutofill(false);
      }
    };

    fetchAutofillData();
  }, []);

  // Apply autofill data to form
  const applyAutofill = () => {
    if (!autofillData) {
      console.log('No product autofill data available');
      return;
    }

    console.log('Applying product autofill with data:', autofillData);

    // Create a synthetic event to trigger onChange for each field
    // Field names should match the 'name' attributes in the input elements
    const fields = [
      { name: 'name', value: autofillData.productName || '' },
      { name: 'price', value: autofillData.price || 0 },
      { name: 'currency', value: autofillData.currency || 'INR' },
      // Note: brand, category, subcategory are not in the current form
      // but are in the API response - can be added later if form is updated
    ];

    console.log('Product fields to autofill:', fields);

    fields.forEach(field => {
      const syntheticEvent = {
        target: {
          name: field.name,
          value: field.value,
          type: field.name === 'price' ? 'number' : 'text'
        }
      } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

      console.log('Triggering onChange for field:', field.name, 'with value:', field.value);
      onChange(syntheticEvent);
    });

    console.log('Product autofill completed');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6 border-2 border-yellow-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg text-black font-semibold">Product Details</h3>
        {autofillData && (
          <button
            onClick={applyAutofill}
            disabled={isLoadingAutofill}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingAutofill ? 'Loading...' : 'Auto-fill from Previous'}
          </button>
        )}
      </div>
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
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
          <input
            type="number"
            name="price"
            min="0"
            placeholder="Enter price"
            value={formData.product.price === 0 ? '' : formData.product.price}
            onChange={onChange}
            className="w-full p-3 border text-gray-900 border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
            ${formData.product.currency === '' ? 'text-black' : 'text-gray-900'}`}
        >
          <option value="" disabled className='text-black'>Select currency</option>
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
