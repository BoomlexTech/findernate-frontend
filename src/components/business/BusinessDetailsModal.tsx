import { AddBusinessDetails, UpdateBusinessDetails, GetBusinessDetails } from "@/api/business";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";

type SocialMedia = { platform: string; url: string };
type BusinessDetails = {
  businessName: string;
  businessType: string;
  description: string;
  tags: string[];
  category: string;
  contact: {
    phone: string;
    email: string;
    website: string;
    socialMedia: SocialMedia[];
  };
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  website: string;
  gstNumber: string;
  aadhaarNumber: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BusinessDetails) => void;
  isEdit?: boolean; // Simple boolean to determine if it's edit mode
};

const defaultData: BusinessDetails = {
  businessName: "",
  businessType: "",
  description: "",
  tags: [],
  category: "",
  contact: {
    phone: "",
    email: "",
    website: "",
    socialMedia: [{ platform: "", url: "" }],
  },
  location: {
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  },
  website: "",
  gstNumber: "",
  aadhaarNumber: "",
};

const BusinessDetailsModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  isEdit = false // Default to create mode
}) => {
  const [form, setForm] = useState<BusinessDetails>(defaultData);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  // Fetch business details when in edit mode
  useEffect(() => {
    const fetchBusinessDetails = async () => {
      if (isEdit && isOpen) {
        console.log('🔄 Fetching business details...'); // Debug log
        setFetchingData(true);
        try {
          const response = await GetBusinessDetails();
          console.log('📡 API Response:', response); // Debug log
          
          if (response && response.data && response.data.business) {
            const businessData = response.data.business; // Extract the actual business data
            console.log('✅ Business data:', businessData); // Debug log
            
            // Map the API response to form structure
            const formData = {
              businessName: businessData.businessName || '',
              businessType: businessData.businessType || '',
              description: businessData.description || '',
              category: businessData.category || '',
              tags: Array.isArray(businessData.tags) ? businessData.tags : [],
              contact: {
                phone: businessData.contact?.phone || '',
                email: businessData.contact?.email || '',
                website: businessData.contact?.website || '',
                socialMedia: Array.isArray(businessData.contact?.socialMedia) 
                  ? businessData.contact.socialMedia 
                  : [{ platform: "", url: "" }],
              },
              location: {
                address: businessData.location?.address || '',
                city: businessData.location?.city || '',
                state: businessData.location?.state || '',
                country: businessData.location?.country || '',
                pincode: businessData.location?.pincode || '',
              },
              website: businessData.website || '',
              gstNumber: businessData.gstNumber || '',
              aadhaarNumber: businessData.aadhaarNumber || '',
            };
            
            console.log('📝 Setting form data:', formData); // Debug log
            setForm(formData);
          } else {
            console.log('❌ No business data in response'); // Debug log
          }
        } catch (error) {
          console.error('❌ Error fetching business details:', error);
          // You might want to show a toast/notification here
        } finally {
          setFetchingData(false);
        }
      } else {
        console.log('⏸️ Not fetching - isEdit:', isEdit, 'isOpen:', isOpen); // Debug log
      }
    };

    fetchBusinessDetails();
  }, [isEdit, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setForm(defaultData);
      setTagInput("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      setForm((prev) => ({
        ...prev,
        location: { ...prev.location, [name.split(".")[1]]: value },
      }));
    } else if (name.startsWith("contact.")) {
      setForm((prev) => ({
        ...prev,
        contact: { ...prev.contact, [name.split(".")[1]]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSocialChange = (idx: number, field: "platform" | "url", value: string) => {
    setForm((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        socialMedia: prev.contact.socialMedia.map((sm, i) =>
          i === idx ? { ...sm, [field]: value } : sm
        ),
      },
    }));
  };

  const addSocial = () => {
    setForm((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        socialMedia: [...prev.contact.socialMedia, { platform: "", url: "" }],
      },
    }));
  };

  const removeSocial = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        socialMedia: prev.contact.socialMedia.filter((_, i) => i !== idx),
      },
    }));
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && form.tags && !form.tags.includes(trimmedTag)) {
      setForm(prev => ({
        ...prev,
        tags: [...(prev.tags || []), trimmedTag]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let response;
      
      if (isEdit) {
        // Edit mode: PATCH API
        response = await UpdateBusinessDetails(form);
      } else {
        // Create mode: POST API
        response = await AddBusinessDetails(form);
      }
      
      console.log('Success:', response);
      onClose(); // Close modal on success
      onSubmit(form);
      // You might want to show a success toast/notification here
      
    } catch (error) {
      console.error('Error:', error);
      // You might want to show an error toast/notification here
    } finally {
      setLoading(false);
    }
  };

  // Get modal title based on mode
  const getModalTitle = () => {
    return isEdit ? 'Edit Business Details' : 'Add Business Details';
  };

  // Get submit button text based on mode
  const getSubmitButtonText = () => {
    if (loading) return 'Saving...';
    return isEdit ? 'Update Business Details' : 'Submit Business Details';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh] hide-scrollbar">
        {/* Header */}
        <div className="bg-button-gradient px-8 py-6 relative">
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-3xl font-bold text-black mb-2">{getModalTitle()}</h2>
          <p className="text-black">
            {isEdit 
              ? 'Update your business profile information' 
              : 'Complete your business profile information'
            }
          </p>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {fetchingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading business details...</span>
            </div>
          ) : (
            <div className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-yellow-600 pl-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Business Name *</label>
                  <input 
                    name="businessName" 
                    value={form.businessName} 
                    onChange={handleChange} 
                    placeholder="Enter your business name" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Business Type *</label>
                  <input 
                    name="businessType" 
                    value={form.businessType} 
                    onChange={handleChange} 
                    placeholder="e.g., LLC, Corporation, Partnership" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Category *</label>
                  <input 
                    name="category" 
                    value={form.category} 
                    onChange={handleChange} 
                    placeholder="Industry category" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <input 
                    name="website" 
                    value={form.website} 
                    onChange={handleChange} 
                    placeholder="https://www.yourwebsite.com" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">GST Number</label>
                  <input 
                    name="gstNumber" 
                    value={form.gstNumber} 
                    onChange={handleChange} 
                    placeholder="GST registration number" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                  <input 
                    name="aadhaarNumber" 
                    value={form.aadhaarNumber} 
                    onChange={handleChange} 
                    placeholder="Aadhaar number" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  placeholder="Describe your business..." 
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500 resize-none" 
                  required 
                />
              </div>

              {/* Tags field - interactive tag system */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  
                  {/* Display existing tags */}
                  {form.tags && form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {form.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-yellow-600 hover:text-yellow-800 focus:outline-none"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Tag input */}
                  <div className="flex gap-2">
                    <input 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      placeholder="Type a tag and press Enter or comma" 
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500" 
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={!tagInput.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-button-gradient rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Add
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    Press Enter or comma to add tags. Click × to remove tags.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-yellow-600 pl-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input 
                    name="contact.phone" 
                    value={form.contact.phone} 
                    onChange={handleChange} 
                    placeholder="+91 98765 43210" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    name="contact.email" 
                    value={form.contact.email} 
                    onChange={handleChange} 
                    placeholder="contact@business.com" 
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500" 
                  />
                </div>
              </div>

              {/* Social Media Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Social Media</label>
                <div className="space-y-3">
                  {form.contact.socialMedia.map((sm, idx) => (
                    <div key={idx} className="flex gap-3 items-end">
                      <div className="flex-1 space-y-2">
                        <input
                          value={sm.platform}
                          onChange={e => handleSocialChange(idx, "platform", e.target.value)}
                          placeholder="Platform (e.g., LinkedIn, Facebook)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          value={sm.url}
                          onChange={e => handleSocialChange(idx, "url", e.target.value)}
                          placeholder="Profile URL"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeSocial(idx)} 
                        className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  onClick={addSocial} 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 hover:border-yellow-300 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Social Media
                </button>
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-yellow-600 pl-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Location</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input 
                    name="location.address" 
                    value={form.location.address} 
                    onChange={handleChange} 
                    placeholder="Street address" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input 
                    name="location.city" 
                    value={form.location.city} 
                    onChange={handleChange} 
                    placeholder="City" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input 
                    name="location.state" 
                    value={form.location.state} 
                    onChange={handleChange} 
                    placeholder="State" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input 
                    name="location.country" 
                    value={form.location.country} 
                    onChange={handleChange} 
                    placeholder="Country" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input 
                    name="location.pincode" 
                    value={form.location.pincode} 
                    onChange={handleChange} 
                    placeholder="PIN/ZIP code" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500" 
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleSubmit} 
                disabled={loading || fetchingData}
                className="w-full bg-button-gradient text-white py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-4 focus:ring-blue-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {getSubmitButtonText()}
              </Button>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailsModal;