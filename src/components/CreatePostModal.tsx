'use client'
import React, { useState } from 'react';
import { X, Camera, MapPin, Hash } from 'lucide-react';
import Image from 'next/image';

interface createPostModalProps {
    closeModal: () => void;
}

const CreatePostModal = ({closeModal}: createPostModalProps ) => {
  const [postType, setPostType] = useState('Regular Post');
  const [postContent, setPostContent] = useState('');
  const [location, setLocation] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [images, setImages] = useState<File[]>([]);


  const handleImageUpload = (e:React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length <= 5) {
      setImages([...images, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    console.log('Post submitted:', {
      type: postType,
      content: postContent,
      location,
      hashtags,
      images
    });
    // Handle post submission logic here
    
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
              PS
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-gray-800">Priya Sharma</h3>
              <p className="text-sm text-gray-500">@priya_enterprises</p>
            </div>
          </div>

          {/* Post Type Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setPostType('Regular Post')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                postType === 'Regular Post'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Regular Post
            </button>
            <button
              onClick={() => setPostType('Product')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                postType === 'Product'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              📦 Product
            </button>
            <button
              onClick={() => setPostType('Service')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                postType === 'Service'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              🔧 Service
            </button>
          </div>

          {/* Post Content */}
          <div className="mb-6">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full h-32 p-4 border border-gray-300 placeholder:text-gray-500 text-black rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Images Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Images</span>
              <span className="text-sm text-gray-500">{images.length}/5</span>
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
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 cursor-pointer transition-colors"
              >
                📎 Add Images
              </label>
              <p className="text-xs text-gray-400 mt-2">
                Tip: Upload high-quality images to showcase your content better
              </p>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <Image
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
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="Add hashtags..."
              className="w-full p-3 border border-gray-300 placeholder:text-gray-500 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={closeModal}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;