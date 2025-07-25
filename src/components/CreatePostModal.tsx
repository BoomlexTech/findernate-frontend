'use client'
import React, { useState } from 'react';
import { X, Camera, MapPin, Hash, ShoppingBag, BriefcaseBusiness, Building2  } from 'lucide-react';
import Image from 'next/image';
import { Button } from './ui/button';
import ProductDetailsForm from './posting/ProductDetailsForm';
import ServiceDetailsForm from './posting/ServiceDetailsForm';
import BusinessDetailsForm from './posting/BusinessDetailsForm';
import { createProductPost, createRegularPost, createServicePost, createBusinessPost } from '@/api/post';
import { ProductDetailsFormProps, RegularPostPayload, ServiceDetailsFormProps, BusinessPostFormProps } from '@/types';
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
    mentions: [] as string[],
    mood: 'testing',
    activity: 'testing',
    settings: {
      visibility: 'public',
      allowComments: true,
      allowLikes: true,
    }, 
    product: {
      name: '',
      price: '',
      currency: '',
      link:'',
      inStock: true,
    },
    status: 'scheduled',
}); 

const [serviceForm, setServiceForm] = useState({
  // Shared post fields
  postType: 'photo', // or whatever type you need
  mentions: [], // Array of user IDs
  settings: {
    visibility: 'public',
    allowComments: true,
    allowLikes: true,
  },
  status: 'scheduled',

  // Service-specific fields (as an object)
  service: {
    name: '',
    description: '',
    price: '',
    currency: 'INR',
    category: '',
    subcategory: '',
    duration: '',
    serviceType: '', // 'in-person', 'online', 'hybrid'
    availability: {
      schedule: [], // [{ day: 'Monday', timeSlots: [{ startTime: '', endTime: '' }] }]
      timezone: '',
      bookingAdvance: '',
      maxBookingsPerDay: '',
    },
    location: {
      type: '', // 'studio', 'home', etc.
      address: '',
      city: '',
      state: '',
      country: '',
      coordinates: undefined, // { type: 'Point', coordinates: [lng, lat] } or undefined
    },
    requirements: [],
    deliverables: [],
    tags: [],
    link:'',
  }
});

const [businessForm, setBusinessForm] = useState<BusinessPostFormProps>({
  formData: {
  postType: 'photo',
  caption: '',
  description: '',
  image: [],
  mentions: [],
  settings: {
    visibility: 'public',
    allowComments: true,
    allowLikes: true,
  },
  status: 'scheduled',
  business: {
    businessName: '',
    businessType: '',
    description: '',
    category: '',
    subcategory: '',
    contact: {
      phone: '',
      email: '',
      website: '',
      socialMedia: [],
    },
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    hours: [
      // Example: { day: 'Monday', openTime: '', closeTime: '', isClosed: false }
    ],
    features: [],
    priceRange: '',
    rating: 0,
    tags: [],
    announcement: '',
    promotions: [
      { title: '', description: '', discount: 0, validUntil: '', isActive: false }
    ],
    link: '',
  }
},
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
  const target = e.target;
  const { name, value, type } = target;

  setProductForm((prev) => ({
    ...prev,
    product: {
      ...prev.product,
      [name]: type === 'checkbox' ? (target as HTMLInputElement).checked : value,
    },
  }));
};

  const handleServiceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setServiceForm((prev) => {
      // 1. Fields inside service
      if (name in prev.service) {
        return {
          ...prev,
          service: {
            ...prev.service,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
          }
        };
      }
      // 2. Top-level fields
      if (name in prev) {
        return {
          ...prev,
          [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        };
      }
      // 3. Fields inside service.location
      if (name in prev.service.location) {
        return {
          ...prev,
          service: {
            ...prev.service,
            location: {
              ...prev.service.location,
              [name]: value,
            }
          }
        };
      }
      // 4. Fields inside service.availability
      if (name in prev.service.availability) {
        return {
          ...prev,
          service: {
            ...prev.service,
            availability: {
              ...prev.service.availability,
              [name]: value,
            }
          }
        };
      }
      // 5. Add more nested cases as needed (e.g., requirements, deliverables, tags, etc.)
  
      return prev; // fallback
    });
  };
  
  const handleBusinessChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBusinessForm((prev) => {
    const formData = JSON.parse(JSON.stringify(prev.formData));
    
    if (
      formData.business &&
      typeof formData.business.location === 'object' &&
      formData.business.location !== null &&
      name in formData.business.location
    ) {
      formData.business.location[name] = value;
    }
      else if (formData.business && typeof formData.business === 'object' && name in formData.business) {
        formData.business[name] = value;
      }
       // Handle top-level business fields
       else if (formData.business && name in formData.business) {
        formData.business[name] = value;
      }
      // Handle nested fields
      else if (name === "discount" || name === "isActive" || name === "validUntil") {
        if (!formData.business.promotions[0]) {
          formData.business.promotions[0] = { title: '', description: '', discount: 0, validUntil: '', isActive: false };
        }
        if (name === "discount") {
          formData.business.promotions[0].discount = Number(value);
        } else if (name === "isActive") {
          formData.business.promotions[0].isActive = value === "Active";
        } else if (name === "validUntil") {
          formData.business.promotions[0].validUntil = value;
        }  
      }
      // Add more cases as needed for other nested fields
  
      return { ...prev, formData };
    });
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
        console.log(res);
      } else if (postType === 'Service') {
        console.log('Service Post Data:',sharedForm, serviceForm);
        const servicePayload = finalPayload;
        const res = await createServicePost({formData:servicePayload} as unknown as ServiceDetailsFormProps);
        console.log(res);
       } else if (postType === 'Business') {
        console.log('Business Post Data:', businessForm);
        const res = await createBusinessPost({formData:businessForm} as unknown as BusinessPostFormProps);
        console.log(res);
       }
    }
    catch (err) {
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
            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
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
          <div className="mb-1">
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
              formData={businessForm.formData}
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
              value={sharedForm.tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(', ')}
              onChange={(e) => {
                const updatedTags = e.target.value
                .split(',')
                .map(tag => tag.trim().replace(/^#*/, '')) // remove any existing #
                .filter(Boolean); // remove empty strings
                setSharedForm({...sharedForm, tags: updatedTags})
                }
              }
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