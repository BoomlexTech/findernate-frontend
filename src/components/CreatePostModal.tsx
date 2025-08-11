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

  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Image compression utility
  const compressImage = (file: File, quality: number = 0.8, maxWidth: number = 1920): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new window.Image();
      
      img.onload = () => {
        // Calculate new dimensions
        const { width, height } = img;
        const aspectRatio = width / height;
        
        let newWidth = width;
        let newHeight = height;
        
        if (width > maxWidth) {
          newWidth = maxWidth;
          newHeight = maxWidth / aspectRatio;
        }
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Video compression utility using canvas and ffmpeg-like approach
  const compressVideo = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Set compressed dimensions (reduce by 50% if too large)
        const maxWidth = 1280;
        const maxHeight = 720;
        
        let { videoWidth: width, videoHeight: height } = video;
        const aspectRatio = width / height;
        
        if (width > maxWidth) {
          width = maxWidth;
          height = maxWidth / aspectRatio;
        }
        if (height > maxHeight) {
          height = maxHeight;
          width = maxHeight * aspectRatio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Create MediaRecorder for video compression
        const stream = canvas.captureStream(25); // 25 FPS
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: 1000000 // 1Mbps
        });
        
        const chunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const compressedBlob = new Blob(chunks, { type: 'video/webm' });
          const compressedFile = new File([compressedBlob], 
            file.name.replace(/\.[^/.]+$/, '.webm'), {
            type: 'video/webm',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        };
        
        // Start recording and play video
        mediaRecorder.start();
        video.currentTime = 0;
        video.play();
        
        video.ontimeupdate = () => {
          if (video.currentTime < video.duration) {
            ctx.drawImage(video, 0, 0, width, height);
          } else {
            video.pause();
            mediaRecorder.stop();
            URL.revokeObjectURL(video.src);
          }
        };
      };
      
      video.onerror = () => reject(new Error('Failed to load video for compression'));
    });
  };

  // Optimize file based on type and size
  const optimizeFile = async (file: File): Promise<File> => {
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit for Cloudinary
    
    if (file.size <= maxSizeBytes) {
      return file; // No optimization needed
    }
    
    setIsOptimizing(true);
    
    try {
      if (file.type.startsWith('image/')) {
        // Compress image with progressive quality reduction
        let quality = 0.8;
        let optimizedFile = await compressImage(file, quality);
        
        // Keep reducing quality until under size limit
        while (optimizedFile.size > maxSizeBytes && quality > 0.3) {
          quality -= 0.1;
          optimizedFile = await compressImage(file, quality, 1280); // Also reduce max width
        }
        
        return optimizedFile;
      } else if (file.type === 'video/mp4') {
        // For large videos, use basic compression
        const optimizedFile = await compressVideo(file);
        return optimizedFile;
      }
    } catch (error) {
      console.error('File optimization failed:', error);
      toast.error('File optimization failed. Please try a smaller file.');
    } finally {
      setIsOptimizing(false);
    }
    
    return file;
  };

  const detectVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        resolve(duration);
      };
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video metadata'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const updatePostTypeBasedOnVideo = async (file: File) => {
    if (file.type === 'video/mp4') {
      try {
        const duration = await detectVideoDuration(file);
        setVideoDuration(duration);
        
        // Update regularForm postType based on duration
        if (duration <= 60) { // 60 seconds = 1 minute
          setRegularForm(prev => ({ ...prev, postType: 'reel' }));
        } else {
          setRegularForm(prev => ({ ...prev, postType: 'video' }));
        }
      } catch (error) {
        console.error('Error detecting video duration:', error);
        // Default to video if we can't detect duration
        setRegularForm(prev => ({ ...prev, postType: 'video' }));
      }
    }
  };

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

  const handleImageUpload = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + sharedForm.image.length <= 5) {
      const optimizedFiles: File[] = [];
      
      // Show optimization progress
      if (files.some(file => file.size > 10 * 1024 * 1024)) {
        toast.info('Large files detected. Optimizing for upload...', {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
      // Optimize each file
      for (const file of files) {
        try {
          const optimizedFile = await optimizeFile(file);
          optimizedFiles.push(optimizedFile);
          
          // Check for MP4 videos and update post type accordingly
          if (file.type === 'video/mp4' || optimizedFile.type.startsWith('video/')) {
            await updatePostTypeBasedOnVideo(optimizedFile);
          }
        } catch (error) {
          console.error('Failed to optimize file:', file.name, error);
          toast.error(`Failed to optimize ${file.name}. Please try a smaller file.`);
          return;
        }
      }
      
      setSharedForm((prev) => ({
        ...prev,
        image: [...prev.image, ...optimizedFiles]
      }));
      
      // Show success message if files were optimized
      const originalSize = files.reduce((acc, file) => acc + file.size, 0);
      const optimizedSize = optimizedFiles.reduce((acc, file) => acc + file.size, 0);
      
      if (originalSize > optimizedSize) {
        const savedMB = ((originalSize - optimizedSize) / 1024 / 1024).toFixed(1);
        toast.success(`Files optimized! Saved ${savedMB}MB of upload data.`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
    } else {
      toast.error('You can upload a maximum of 5 files.', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const removeImage = (index: number) => {
    const removedFile = sharedForm.image[index];
    setSharedForm({...sharedForm, image: sharedForm.image.filter((_, i) => i !== index)});
    
    // Reset video duration and post type if removing a video
    if (removedFile.type === 'video/mp4') {
      setVideoDuration(null);
      setRegularForm(prev => ({ ...prev, postType: 'photo' }));
    }
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
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
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
        <div className="flex-1 overflow-y-auto subtle-scrollbar p-6">
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
              disabled={loading || isOptimizing}
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

          {/* Media Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Media</span>
              <span className="text-sm text-gray-500">{sharedForm.image.length}/5</span>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Add Photos & Videos</h3>
              <p className="text-sm text-gray-500 mb-4">
                Upload up to 5 images (JPG, PNG, GIF) or MP4 videos
              </p>
              <input
                type="file"
                multiple
                accept="image/*,video/mp4"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 bg-button-gradient text-white rounded-lg hover:bg-yellow-700 cursor-pointer transition-colors"
              >
                📎 Add Images & Videos
              </label>
              <p className="text-xs text-gray-400 mt-2">
                Tip: Large files are automatically optimized. MP4 videos under 1 minute become reels, longer videos become regular video posts.
              </p>
              {isOptimizing && (
                <div className="mt-2 flex items-center justify-center text-yellow-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent mr-2"></div>
                  Optimizing files for upload...
                </div>
              )}
            </div>

            {/* Media Preview */}
            {sharedForm.image.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {sharedForm.image.map((file, index) => (
                  <div key={index} className="relative">
                    {file.type.startsWith('image/') ? (
                      <div className="w-20 h-20 relative">
                        <Image
                          width={100}
                          height={100}
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg">
                          {(file.size / 1024 / 1024).toFixed(1)}MB
                        </div>
                      </div>
                    ) : file.type === 'video/mp4' ? (
                      <div className="w-20 h-20 relative">
                        <video
                          src={URL.createObjectURL(file)}
                          className="w-full h-full object-cover rounded-lg border"
                          muted
                        />
                        <div className="absolute inset-0 bg-black/30 rounded-lg flex flex-col items-center justify-center p-1">
                          <div className="text-white text-xs font-semibold bg-black/50 px-1 rounded mb-1">
                            {file.type === 'video/mp4' && videoDuration ? 
                              `${Math.round(videoDuration)}s ${videoDuration <= 60 ? '(Reel)' : '(Video)'}` : 
                              'Video'
                            }
                          </div>
                          <div className="text-white text-xs bg-black/50 px-1 rounded">
                            {(file.size / 1024 / 1024).toFixed(1)}MB
                          </div>
                        </div>
                      </div>
                    ) : null}
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
            disabled={loading || isOptimizing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePost}
            className="px-6 py-2 bg-button-gradient text-white rounded-lg hover:bg-yellow-700 transition-colors cursor-pointer"
            disabled={loading || isOptimizing}
          >
            {loading ? 'Posting...': 'Post'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;