'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    platformName: 'Findernate',
    platformDescription: 'A social media platform for connecting people and businesses',
    contactEmail: 'support@findernate.com',
    allowRegistration: true,
    emailVerification: true,
    businessProfiles: true,
    autoModeration: false,
    contentApproval: false,
  });

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleChange = (field: string) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  };
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage platform settings and configurations
          </p>
        </div>

        {/* Settings Tabs */}
        <div className="card p-6">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button className="border-b-2 border-yellow-500 text-yellow-600 py-2 px-1 text-sm font-medium">
                General
              </button>
              <button className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
                Content
              </button>
              <button className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
                Security
              </button>
              <button className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
                Notifications
              </button>
            </nav>
          </div>

          {/* General Settings */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => handleInputChange('platformName', e.target.value)}
                    className="input-field"
                    placeholder="Enter platform name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Description
                  </label>
                  <textarea
                    rows={3}
                    value={settings.platformDescription}
                    onChange={(e) => handleInputChange('platformDescription', e.target.value)}
                    className="input-field"
                    placeholder="Enter platform description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className="input-field"
                    placeholder="Enter contact email"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Allow User Registration</p>
                    <p className="text-sm text-gray-500">Enable new user registrations</p>
                  </div>
                  <button 
                    onClick={() => handleToggleChange('allowRegistration')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.allowRegistration ? 'bg-yellow-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.allowRegistration ? 'translate-x-6' : 'translate-x-1'
                    }`}></span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Verification Required</p>
                    <p className="text-sm text-gray-500">Require email verification for new accounts</p>
                  </div>
                  <button 
                    onClick={() => handleToggleChange('emailVerification')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.emailVerification ? 'bg-yellow-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.emailVerification ? 'translate-x-6' : 'translate-x-1'
                    }`}></span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Business Profiles</p>
                    <p className="text-sm text-gray-500">Allow users to create business profiles</p>
                  </div>
                  <button 
                    onClick={() => handleToggleChange('businessProfiles')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.businessProfiles ? 'bg-yellow-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.businessProfiles ? 'translate-x-6' : 'translate-x-1'
                    }`}></span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Content Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Auto-Moderation</p>
                    <p className="text-sm text-gray-500">Automatically flag suspicious content</p>
                  </div>
                  <button 
                    onClick={() => handleToggleChange('autoModeration')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoModeration ? 'bg-yellow-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.autoModeration ? 'translate-x-6' : 'translate-x-1'
                    }`}></span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Content Approval</p>
                    <p className="text-sm text-gray-500">Require approval for all new posts</p>
                  </div>
                  <button 
                    onClick={() => handleToggleChange('contentApproval')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.contentApproval ? 'bg-yellow-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.contentApproval ? 'translate-x-6' : 'translate-x-1'
                    }`}></span>
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button className="btn-secondary">
                  Reset to Default
                </button>
                <button className="btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}