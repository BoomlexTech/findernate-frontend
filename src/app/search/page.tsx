"use client";

import SearchBar from "@/components/ui/SearchBar";
import { useState } from "react";
import { Search, Users, Hash, Package, Building, Tag, TrendingUp, ChevronDown } from 'lucide-react';
import FloatingHeader from "@/components/FloatingHeader";


export default function SearchPage() {

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [activeTab, setActiveTab] = useState('All');
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const tabs = [
    { id: 'All', label: 'All', icon: Search },
    { id: 'Users', label: 'Users', icon: Users },
    { id: 'Posts', label: 'Posts', icon: Hash },
    { id: 'Products', label: 'Products', icon: Package },
    { id: 'Services', label: 'Services', icon: Building },
    { id: 'Tags', label: 'Tags', icon: Tag }
  ];

  const locations = [
    'All Locations',
    'Mumbai, India',
    'Delhi, India',
    'Bangalore, India',
    'Chennai, India',
    'Kolkata, India',
    'Hyderabad, India',
    'Pune, India'
  ];

  const categories = [
    'All Categories',
    'Fashion & Apparel',
    'Food & Beverages',
    'Technology',
    'Health & Wellness',
    'Home & Garden',
    'Sports & Fitness',
    'Arts & Crafts',
    'Education',
    'Travel & Tourism'
  ];

  const trendingHashtags = [
    '#HandmadeJewelry',
    '#WebDevelopment',
    '#YogaClasses',
    '#TraditionalSweets',
    '#DigitalMarketing',
    '#FashionDesign'
  ];

  const handleHashtagClick = (hashtag: string) => {
    setSearchQuery(prev => {
      if (prev.includes(hashtag)) {
        return prev.replace(hashtag, '').trim();
      }
      return prev ? `${prev} ${hashtag}` : hashtag;
    });
  };

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setLocationDropdownOpen(false);
  };

  const handleCategorySelect = (category:string) => {
    setSelectedCategory(category);
    setCategoryDropdownOpen(false);
  };



  return (
    <div className="min-h-screen flex flex-col gap-10">

      <div className="min-w-5xl mx-auto">
      {/* Search Header */}
      <FloatingHeader
      paragraph="Discover businesses, products, services, and more"
      heading="Search"
      username="John Doe"
      accountBadge={true}/>

      <div className="w-full">
            <SearchBar 
            value={searchQuery}
            placeholder="Search businesses, products, services..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setSearchQuery(e.target.value)}/>
      </div> 

        <div className="flex flex-wrap gap-2 mb-6 mt-10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Location and Category Dropdowns */}
      <div className="flex gap-4 mb-8">
        {/* Location Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setLocationDropdownOpen(!locationDropdownOpen);
              setCategoryDropdownOpen(false);
            }}
            className="flex items-center justify-between w-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span>{selectedLocation}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${locationDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {locationDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
              {locations.map((location) => (
                <button
                  key={location}
                  onClick={() => handleLocationSelect(location)}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                    selectedLocation === location ? 'bg-yellow-50 text-yellow-800' : 'text-gray-700'
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setCategoryDropdownOpen(!categoryDropdownOpen);
              setLocationDropdownOpen(false);
            }}
            className="flex items-center justify-between w-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span>{selectedCategory}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {categoryDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                    selectedCategory === category ? 'bg-yellow-50 text-yellow-800' : 'text-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trending Searches */}
      <div>
        <div className="flex items-center gap-2 mb-4 mt-2">
          <TrendingUp className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Trending Searches</h3>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {trendingHashtags.map((hashtag) => (
            <button
              key={hashtag}
              onClick={() => handleHashtagClick(hashtag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                searchQuery.includes(hashtag)
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {hashtag}
            </button>
          ))}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(locationDropdownOpen || categoryDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setLocationDropdownOpen(false);
            setCategoryDropdownOpen(false);
          }}
        />
      )}
    </div>
    </div>
  );
}
