'use client';

import React, { useState } from 'react';
import { Lock, Unlock, Phone, PhoneOff, MapPin, MapPinOff } from 'lucide-react';
import { toggleAccountPrivacy, togglePhoneVisibility, toggleAddressVisibility } from '@/api/privacy';
import { toast } from 'react-toastify';
import { useUserStore } from '@/store/useUserStore';

interface PrivacySettingsProps {
  userPrivacy?: string;
  isPhoneHidden?: boolean;
  isAddressHidden?: boolean;
  onPrivacyUpdate?: (privacy: string) => void;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  userPrivacy = 'public',
  isPhoneHidden = false,
  isAddressHidden = false,
  onPrivacyUpdate
}) => {
  const [privacy, setPrivacy] = useState(userPrivacy);
  const [phoneHidden, setPhoneHidden] = useState(isPhoneHidden);
  const [addressHidden, setAddressHidden] = useState(isAddressHidden);
  const [loading, setLoading] = useState({
    privacy: false,
    phone: false,
    address: false
  });

  const { updateUser } = useUserStore();

  const handlePrivacyToggle = async () => {
    setLoading(prev => ({ ...prev, privacy: true }));
    try {
      const response = await toggleAccountPrivacy();
      const newPrivacy = response.data.privacy;

      setPrivacy(newPrivacy);
      updateUser({ privacy: newPrivacy });
      onPrivacyUpdate?.(newPrivacy);

      toast.success(`Account is now ${newPrivacy}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update privacy settings', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(prev => ({ ...prev, privacy: false }));
    }
  };

  const handlePhoneToggle = async () => {
    setLoading(prev => ({ ...prev, phone: true }));
    try {
      const response = await togglePhoneVisibility();
      const isHidden = response.data.isPhoneNumberHidden;

      setPhoneHidden(isHidden);
      updateUser({ isPhoneNumberHidden: isHidden });

      toast.success(`Phone number is now ${isHidden ? 'hidden' : 'visible'}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update phone visibility', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(prev => ({ ...prev, phone: false }));
    }
  };

  const handleAddressToggle = async () => {
    setLoading(prev => ({ ...prev, address: true }));
    try {
      const response = await toggleAddressVisibility();
      const isHidden = response.data.isAddressHidden;

      setAddressHidden(isHidden);
      updateUser({ isAddressHidden: isHidden });

      toast.success(`Address is now ${isHidden ? 'hidden' : 'visible'}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update address visibility', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(prev => ({ ...prev, address: false }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Privacy Settings</h3>

      <div className="space-y-4">
        {/* Account Privacy */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {privacy === 'private' ? (
              <Lock className="w-5 h-5 text-red-500" />
            ) : (
              <Unlock className="w-5 h-5 text-green-500" />
            )}
            <div>
              <h4 className="font-medium text-gray-800">Account Privacy</h4>
              <p className="text-sm text-gray-600">
                {privacy === 'private'
                  ? 'Your account is private. Only approved followers can see your posts.'
                  : 'Your account is public. Anyone can see your posts.'
                }
              </p>
            </div>
          </div>
          <button
            onClick={handlePrivacyToggle}
            disabled={loading.privacy}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              privacy === 'private'
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } ${loading.privacy ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading.privacy ? 'Updating...' : privacy === 'private' ? 'Make Public' : 'Make Private'}
          </button>
        </div>

        {/* Phone Number Visibility */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {phoneHidden ? (
              <PhoneOff className="w-5 h-5 text-red-500" />
            ) : (
              <Phone className="w-5 h-5 text-green-500" />
            )}
            <div>
              <h4 className="font-medium text-gray-800">Phone Number</h4>
              <p className="text-sm text-gray-600">
                {phoneHidden
                  ? 'Your phone number is hidden from your profile.'
                  : 'Your phone number is visible on your profile.'
                }
              </p>
            </div>
          </div>
          <button
            onClick={handlePhoneToggle}
            disabled={loading.phone}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              phoneHidden
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } ${loading.phone ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading.phone ? 'Updating...' : phoneHidden ? 'Show' : 'Hide'}
          </button>
        </div>

        {/* Address Visibility */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {addressHidden ? (
              <MapPinOff className="w-5 h-5 text-red-500" />
            ) : (
              <MapPin className="w-5 h-5 text-green-500" />
            )}
            <div>
              <h4 className="font-medium text-gray-800">Address</h4>
              <p className="text-sm text-gray-600">
                {addressHidden
                  ? 'Your address is hidden from your profile.'
                  : 'Your address is visible on your profile.'
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleAddressToggle}
            disabled={loading.address}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              addressHidden
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } ${loading.address ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading.address ? 'Updating...' : addressHidden ? 'Show' : 'Hide'}
          </button>
        </div>
      </div>

      {privacy === 'private' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Private Account:</strong> When your account is private, new followers need your approval.
            You can manage follow requests in the notifications section.
          </p>
        </div>
      )}
    </div>
  );
};

export default PrivacySettings;