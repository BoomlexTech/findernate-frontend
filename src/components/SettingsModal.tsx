"use client";

import { ChevronLeft, Globe, Bell, Volume2, User, HelpCircle, LogOut, Shield, MapPin, Phone, ChevronRight, ChevronDown, Layers } from "lucide-react";
import { useState } from "react";

const SettingsModal = ({ onClose }: { onClose: () => void }) => {
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [hideAddress, setHideAddress] = useState(false);
  const [hideNumber, setHideNumber] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md h-[90vh] rounded-xl shadow-lg overflow-y-scroll relative">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-4 py-4 flex items-center justify-center border-b border-gray-200">
          <ChevronLeft
            className="w-6 h-6 text-gray-600 absolute left-4 cursor-pointer"
            onClick={onClose}
          />
          <h1 className="text-2xl font-medium text-black">Settings</h1>
        </div>

        {/* Content */}
        <div className="px-4 py-2">
          <SettingItem icon={<Shield />} title="Upgrade Business Profile" />
          <SettingItem
            icon={<Globe />}
            title="Language"
            right={
              <div className="flex items-center gap-2 text-gray-600">
                <span>English</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            }
          />
          <SettingToggle
            icon={<Volume2 />}
            title="Mute Notification"
            enabled={muteNotifications}
            onToggle={() => setMuteNotifications(!muteNotifications)}
          />
          <SettingItem icon={<Bell />} title="Custom Notification" />
          <SettingItem icon={<User />} title="Account" />
          <SettingItem icon={<Layers />} title="About App" />
          <SettingItem icon={<HelpCircle />} title="Help Center" />
        </div>

        <div className="h-px bg-gray-200 mx-4"></div>

        <div className="px-4 py-6">
          <h2 className="text-gray-500 font-medium text-sm mb-4">Business Info</h2>
          <div className="space-y-0">
            <SettingItem icon={<Shield />} title="View Your Business Details" />
            <SettingItem icon={<Shield />} title="Complete your KYC" />
            <SettingItem icon={<Shield />} title="Promote Your Business" />
            <SettingItem icon={<Shield />} title="Edit Your Business Details" />
            <SettingToggle
              icon={<MapPin />}
              title="Hide Address"
              enabled={hideAddress}
              onToggle={() => setHideAddress(!hideAddress)}
            />
            <SettingToggle
              icon={<Phone />}
              title="Hide Number"
              enabled={hideNumber}
              onToggle={() => setHideNumber(!hideNumber)}
            />
          </div>
        </div>

        <div className="h-px bg-gray-200 mx-4"></div>

        <div className="px-4 py-2">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="text-red-500 font-medium">Logout</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingItem = ({
  icon,
  title,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex items-center gap-3">
      <span className="text-gray-600">{icon}</span>
      <span className="text-gray-900 font-medium">{title}</span>
    </div>
    {right ?? <ChevronRight className="w-5 h-5 text-gray-400" />}
  </div>
);

const SettingToggle = ({
  icon,
  title,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  enabled: boolean;
  onToggle: () => void;
}) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex items-center gap-3">
      <span className="text-gray-600">{icon}</span>
      <span className="text-gray-900 font-medium">{title}</span>
    </div>
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={enabled}
        onChange={onToggle}
      />
      <div
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
          enabled ? "bg-gray-400" : "bg-gray-300"
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
            enabled ? "translate-x-6" : "translate-x-0.5"
          }`}
        ></div>
      </div>
    </label>
  </div>
);

export default SettingsModal;
