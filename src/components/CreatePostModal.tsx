'use client'
import React, { useState } from 'react';
import { X, Camera, MapPin, Hash, ShoppingBag, BriefcaseBusiness, Building2  } from 'lucide-react';
import Image from 'next/image';
import { Button } from './ui/button';
import ProductDetailsForm from './posting/ProductDetailsForm';
import ServiceDetailsForm from './posting/ServiceDetailsForm';
import BusinessDetailsForm from './posting/BusinessDetailsForm';
import { createProductPost, createRegularPost } from '@/api/post';
import { ProductDetailsFormProps, RegularPostPayload } from '@/types';
import RegularPostForm from './posting/RegularDetailsForm';

interface createPostModalProps {
    closeModal: () => void;
}

const CreatePostModal = ({closeModal}: createPostModalProps ) => {
  const [postType, setPostType] = useState('Regular');
  const [loading, setLoading] = useState(false);


  const [sharedForm, setSharedForm] = useState({
  description: '',
  caption: '',
  image: [] as File [], // array of File objects or URLs
  location: {name:''},
  tags: [] as string [],
});

  const [regularForm, setRegularForm] = useState({
    postType: 'photo',
    caption: '',
    mood: '',
    activity: '',
    mentions: [] as string[],
    settings: {
      visibility: 'public',
      allowComments: true,
      allowLikes: true,
    }, 
    status: 'scheduled',
  });

  const [productForm, setProductForm] = useState({
    postType: 'photo',
    mentions: ["686f86a232ff68d345b72ea9"] as string[],
    mood: 'testing',
    activity: 'testing',
    settings: {
      visibility: 'public',
      allowComments: true,
      allowLikes: true,
    }, 
    product: {
      name: 'cool t-shirt',
      price: '999',
      currency: 'INR',
      inStock: true,
    },
    status: 'scheduled',
  });

  const [serviceForm, setServiceForm] = useState({
    serviceName: '',
    price: '',
    category: '',
    description: '',
    available: true,
  });

  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    industry: '',
    location: '',
    description: '',
    open: true,
  });

  const handleRegularChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setRegularForm(prev => ({
    ...prev,
    [name]: value,
   }))
  }
  
  const handleProductChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value, type } = target;
    setProductForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (target as HTMLInputElement).checked : value,
    }));
  };
  const handleServiceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value, type } = target;
    setServiceForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (target as HTMLInputElement).checked : value,
    }));
  };
  
  const handleBusinessChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value, type } = target;
    setBusinessForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpload = (e:React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
     if (files.length + sharedForm.image.length <= 5) {
    setSharedForm((prev) => ({
      ...prev,
      image: [...prev.image, ...files]
    }));
  } else {
    // Optional: show error or toast if limit exceeded
    console.warn('You can upload a maximum of 5 images.');
  }
  };

  const removeImage = (index: number) => {
    setSharedForm({...sharedForm, image: sharedForm.image.filter((_, i) => i !== index)});
  };

  const buildPostPayload = () => {
  switch (postType) {
    case 'Regular':
      return { ...sharedForm, ...regularForm };
    case 'Product':
      return { ...sharedForm, ...productForm };
    case 'Service':
      return { ...sharedForm, ...serviceForm };
    case 'Business':
      return { ...sharedForm, ...businessForm };
    default:
      return { ...sharedForm };
  }
};
  const handlePost = async () => {
    const finalPayload = buildPostPayload();
    setLoading(true);
    try {
      if (postType === 'Regular') {
        console.log("Payload being sent:", sharedForm, regularForm);
        const regularPayload = finalPayload as RegularPostPayload;
        const res = await createRegularPost(regularPayload);
        console.log(res);
      } else if (postType === 'Product') {
        console.log('Product Post Data:',sharedForm, productForm); 
        const productPayload = finalPayload;
        const res = await createProductPost({formData:productPayload} as unknown as ProductDetailsFormProps);
        console.log(res);}
      // } else if (postType === 'Service') {
      //   const res = await createServicePost(serviceForm);
      //   console.log(res);
      // } else if (postType === 'Business') {
      //   const res = await createBusinessPost(businessForm);
      //   console.log(res);
      // }
    } catch (err) {
      console.error(err);
    } finally{
      setLoading(false);
      closeModal();
    }
  };


  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl hide-scrollbar shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Create Post</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Info */}
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-button-gradient rounded-full flex items-center justify-center text-white font-semibold">
              PS
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-gray-800">Priya Sharma</h3>
              <p className="text-sm text-gray-500">@priya_enterprises</p>
            </div>
          </div>

          {/* Post Type Tabs */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant='custom'
              onClick={() => setPostType('Regular')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                postType === 'Regular Post'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Regular Post
            </Button>
            <Button
              variant='custom'
              onClick={() => setPostType('Product')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                postType === 'Product'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingBag className='mr-2' size={16} /> Product
            </Button>
            <Button
              variant='custom'
              onClick={() => setPostType('Service')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                postType === 'Service'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BriefcaseBusiness className='mr-2' size={16} /> Service
            </Button>
            <Button
              variant='custom'
              onClick={() => setPostType('Business')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                postType === 'Business'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Building2 className='mr-2' size={16} /> Business
            </Button>
          </div>

          {/* Post Content */}
          <div className="mb-6">
            <label className='text-black text-bold ml-2'>Add Description</label>
            <textarea
              value={sharedForm.description}
              onChange={(e) => setSharedForm({...sharedForm, description: e.target.value})}
              placeholder="What's on your mind?"
              className="w-full h-32 p-4 border border-gray-300 placeholder:text-gray-500 text-black rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label className='text-black text-bold ml-2'>Add Caption</label> 
            <textarea
              value={sharedForm.caption}
              onChange={(e) => setSharedForm({...sharedForm, caption: e.target.value})}
              placeholder="enter the caption..."
              className="w-full h-15 p-4 border border-gray-300 placeholder:text-gray-500 text-black rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {postType === 'Regular' && (
            <RegularPostForm
              formData={regularForm}
              onChange={handleRegularChange}
            />
          )}
          {postType === 'Product' && (
            <ProductDetailsForm
              formData={productForm}
              onChange={handleProductChange}
            />
          )}
          {postType === 'Service' && (
            <ServiceDetailsForm
              formData={serviceForm}
              onChange={handleServiceChange}
              categories={['Consulting', 'Repair', 'Education', 'Other']}
            />
          )}
          {postType === 'Business' && (
            <BusinessDetailsForm
              formData={businessForm}
              onChange={handleBusinessChange}
            />
          )}

          {/* Images Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Images</span>
              <span className="text-sm text-gray-500">{sharedForm.image.length}/5</span>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Add Photos</h3>
              <p className="text-sm text-gray-500 mb-4">
                Upload up to 5 images (JPG, PNG, GIF - max 5MB each)
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 bg-button-gradient text-white rounded-lg hover:bg-yellow-700 cursor-pointer transition-colors"
              >
                📎 Add Images
              </label>
              <p className="text-xs text-gray-400 mt-2">
                Tip: Upload high-quality images to showcase your content better
              </p>
            </div>

            {/* Image Preview */}
            {sharedForm.image.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {sharedForm.image.map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      width={100}
                      height={100}
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline mr-2" size={16} />
              Location (Optional)
            </label>
            <input
              type="text"
              value={sharedForm.location.name}
              onChange={(e) => setSharedForm({...sharedForm, location: {name: e.target.value}})}
              placeholder="Add location..."
              className="w-full p-3 border border-gray-300 placeholder:text-gray-500 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Hashtags Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="inline mr-2" size={16} />
              Hashtags (Optional)
            </label>
            <input
              type="text"
              value={sharedForm.tags.join(', ')}
              onChange={(e) => setSharedForm({...sharedForm, tags: e.target.value.split(', ')})}
              placeholder="Add hashtags...(without #)"
              className="w-full p-3 border border-gray-300 placeholder:text-gray-500 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={closeModal}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            className="px-6 py-2 bg-button-gradient text-white rounded-lg hover:bg-yellow-700 transition-colors cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Posting...': 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;