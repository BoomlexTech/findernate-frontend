'use client'
import React, { useState } from 'react';
import { X, Camera, MapPin, ShoppingBag, BriefcaseBusiness, Building2  } from 'lucide-react';
import Image from 'next/image';
import { Button } from './ui/button';
import { isAxiosError } from 'axios';
import ProductDetailsForm from './posting/ProductDetailsForm';
import ServiceDetailsForm from './posting/ServiceDetailsForm';
import BusinessDetailsForm from './posting/BusinessDetailsForm';
import { createProductPost, createRegularPost, createServicePost, createBusinessPost } from '@/api/post';
import { ProductDetailsFormProps, RegularPostPayload, ServiceDetailsFormProps, BusinessPostFormProps } from '@/types';
import RegularPostForm from './posting/RegularDetailsForm';
import { useUserStore } from '@/store/useUserStore';
import TagInput from './TagInput';
import { toast } from 'react-toastify';

interface createPostModalProps {
    closeModal: () => void;
}

const CreatePostModal = ({closeModal}: createPostModalProps ) => {
  const { user } = useUserStore();

  // Temporarily show all post types everywhere (unused flag removed)

  // Set default post type to Regular for all users
  const [postType, setPostType] = useState('Regular');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sharedForm, setSharedForm] = useState({
  description: '',
  image: [] as File [], // array of File objects or URLs
  location: {name:''},
  tags: [] as string [],
});

  const [regularForm, setRegularForm] = useState({
    postType: 'photo',
    mood: 'Content', // Default mood since UI field is hidden
    activity: 'Chilling', // Default activity since UI field is hidden
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
      price: 0,
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
    price: 0,
    currency: 'INR',
    category: '',
    subcategory: '',
    duration: 0,
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

const [businessForm, setBusinessForm] = useState({
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
      hours: [],
      features: [],
      priceRange: '',
      rating: 0,
      tags: [],
      announcement: '',
      promotions: [],
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
      [name]: name === 'price' ? (value === '' ? 0 : Number(value)) : (type === 'checkbox' ? (target as HTMLInputElement).checked : value),
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
        const computedValue =
          name === 'price'
            ? (value === '' ? 0 : Number(value))
            : (type === 'checkbox' ? (e.target as HTMLInputElement).checked : value);
        return {
          ...prev,
          service: {
            ...prev.service,
            [name]: computedValue,
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
      const formData = { ...prev.formData };
      
      // Handle location fields
      if (name === 'address') {
        formData.business.location.address = value;
      }
      // Handle promotion fields
      else if (name === 'discount' || name === 'isActive' || name === 'validUntil') {
        if (!formData.business.promotions[0]) {
          (formData.business.promotions as any)[0] = { 
            title: '', 
            description: '', 
            discount: 0, 
            validUntil: '', 
            isActive: false 
          };
        }
        
        if (name === 'discount') {
          (formData.business.promotions as any)[0].discount = Number(value);
        } else if (name === 'isActive') {
          (formData.business.promotions as any)[0].isActive = value === 'Active';
        } else if (name === 'validUntil') {
          (formData.business.promotions as any)[0].validUntil = value;
        }
      }
      // Handle all other business fields
      else if (name in formData.business) {
        formData.business[name] = value;
      }
      
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
  // Create shared form with caption set to description value
  const sharedFormWithCaption = { 
    ...sharedForm, 
    caption: sharedForm.description 
  };
  
  switch (postType) {
    case 'Regular':
      return { ...sharedFormWithCaption, ...regularForm };
    case 'Product':
      return { ...sharedFormWithCaption, ...productForm };
    case 'Service':
      return { ...sharedFormWithCaption, ...serviceForm };
    case 'Business':
      return {
        ...businessForm.formData,  // Get the business form data
        ...sharedFormWithCaption,  // Override with shared form data (images, etc.)
        business: businessForm.formData.business  // Keep the business object
      };
    default:
      return { ...sharedFormWithCaption };
  }
};

  // Business form validation function
  const validateBusinessForm = () => {
    const business = businessForm.formData.business;
    
    if (!business.businessName?.trim()) {
      toast.error('Business name is required', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return false;
    }
    
    if (!business.link?.trim()) {
      toast.error('Business link is required', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return false;
    }
    
    if (!business.announcement?.trim()) {
      toast.error('Business announcement is required', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return false;
    }
    
    if (!business.location?.address?.trim()) {
      toast.error('Business location is required', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return false;
    }
    
    if (!business.description?.trim()) {
      toast.error('Business description is required', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return false;
    }
    
    return true;
  };

  const handlePost = async () => {
    // Validate business form before submission
    if (postType === 'Business' && !validateBusinessForm()) {
      return;
    }
    
    const finalPayload = buildPostPayload();
    console.log('Final payload for business post:', finalPayload);
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (postType === 'Regular') {
        console.log("Payload being sent:", sharedForm, regularForm);
        const regularPayload = finalPayload as RegularPostPayload;
        response = await createRegularPost(regularPayload);
        console.log(response);
      } else if (postType === 'Product') {
        console.log('Product Post Data:',sharedForm, productForm); 
        const productPayload = finalPayload;
        response = await createProductPost({formData:productPayload} as unknown as ProductDetailsFormProps);
        console.log(response);
      } else if (postType === 'Service') {
        console.log('Service Post Data:',sharedForm, serviceForm);
        const servicePayload = finalPayload;
        response = await createServicePost({formData:servicePayload} as unknown as ServiceDetailsFormProps);
        console.log(response);
       } else if (postType === 'Business') {
        console.log('Business Post Data:',sharedForm, businessForm);
        const businessPayload = finalPayload;
        response = await createBusinessPost({formData:businessPayload} as unknown as BusinessPostFormProps);
        console.log(response);
       }

      // Only show success toast if we actually got a successful response
      if (response && (response.status === 200 || response.status === 201 || response.success)) {
        const successMessage = postType === 'Business' 
          ? 'Business post created successfully!' 
          : 'Post created successfully!';
        
        toast.success(successMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setTimeout(() => {
          closeModal();
        }, 1000);
      } else {
        // Handle case where API doesn't return expected success response
        throw new Error('Post creation failed - unexpected response');
      }
      

    } catch (error: unknown) {
      console.error('Error creating post:', error);
      let userMessage = 'Failed to create post. Please try again.';
      if (isAxiosError(error)) {
        userMessage = (error.response?.data as any)?.message || error.message || userMessage;
      } else if (error instanceof Error) {
        userMessage = error.message || userMessage;
      }
      setError(userMessage);
      // Show error message to user (you can replace this with a toast or modal)
      alert(userMessage);

      
      // Show error toast instead of alert
  toast.error(userMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
    } finally {
      setLoading(false);
    }
  };

  // Reset error state when modal closes
  const handleCloseModal = () => {
    setError(null);
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl hide-scrollbar shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Create Post</h2>
          <button
            onClick={handleCloseModal}
            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-button-gradient rounded-full flex items-center justify-center text-white font-semibold">
                {user?.profileImageUrl ? <Image src={user?.profileImageUrl} alt="Profile" width={48} height={48} className="rounded-full" /> : user?.fullName?.charAt(0)}
              </div>
              <div className="ml-3">
                <h3 className="font-semibold text-gray-800">{user?.fullName}</h3>
                <p className="text-sm text-gray-500">{user?.username}</p>
              </div>
            </div>
            <Button
              onClick={handlePost}
              className="px-6 py-2 bg-button-gradient text-white rounded-lg hover:bg-yellow-700 transition-colors cursor-pointer"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Submit Post'}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Post Type Tabs */}
          <div className="flex space-x-4 mb-6">
            {/* Regular Post - Available for everyone */}
            <Button
              variant='custom'
              onClick={() => setPostType('Regular')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                postType === 'Regular'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Regular Post
            </Button>

            {/* Business Post Types - Available for all users */}
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
            <TagInput tags={sharedForm.tags} setTags={(tags) => setSharedForm({...sharedForm, tags})} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button
            onClick={handleCloseModal}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePost}
            className="px-6 py-2 bg-button-gradient text-white rounded-lg hover:bg-yellow-700 transition-colors cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Posting...': 'Post'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;