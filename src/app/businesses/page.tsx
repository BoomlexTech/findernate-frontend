"use client";

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import PostCard from '@/components/PostCard';
import CreatePostModal from '@/components/CreatePostModal';
import FloatingHeader from '@/components/FloatingHeader';
import { getExploreFeed } from '@/api/exploreFeed';
import { transformExploreFeedToFeedPost } from '@/utils/transformExploreFeed';
import { FeedPost } from '@/types';

const BusinessesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [sortBy, setSortBy] = useState("likes");
  const [businesses, setBusinesses] = useState<FeedPost[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  const categories = [
    "Retail & Shopping",
    "Food & Dining", 
    "Health & Wellness",
    "Professional Services",
    "Entertainment & Recreation",
    "Automotive",
    "Home & Garden",
    "Technology"
  ];

  const locations = ["Bangalore, Karnataka", "Chennai, Tamil Nadu", "Mumbai, Maharashtra", "Delhi, India"];

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedLocation("");
    setSelectedPrice("");
    setSortBy("time"); // Reset to default sort
  };

  const fetchBusinesses = async (pageNum: number = 1, reset: boolean = false) => {
    setLoading(true);
    try {
      const response = await getExploreFeed({
        page: pageNum,
        limit: 20, // Fetch more data for better filtering
        types: 'business',
        sortBy: 'time' // Use consistent sorting for base data
      });
      
      const transformedData = transformExploreFeedToFeedPost(response.data.feed);
      
      if (reset) {
        setAllBusinesses(transformedData);
        setBusinesses(transformedData);
      } else {
        const newAllBusinesses = [...allBusinesses, ...transformedData];
        setAllBusinesses(newAllBusinesses);
        setBusinesses(newAllBusinesses);
      }
      
      setHasNextPage(response.data.pagination.hasNextPage);
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data only once on component mount
  useEffect(() => {
    fetchBusinesses(1, true);
    setPage(1);
  }, []);

  // Apply filters whenever filter criteria or data changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCategory, selectedLocation, selectedPrice, sortBy, allBusinesses]);

  const applyFilters = () => {
    let filtered = [...allBusinesses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(business => 
        business.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(business => 
        business.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        business.contentType.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter(business => {
        if (!business.location) return false;
        
        // Handle both string and object location types
        const locationName = typeof business.location === 'string' 
          ? business.location 
          : business.location.name;
          
        return locationName?.toLowerCase().includes(selectedLocation.toLowerCase());
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'likes':
        filtered.sort((a, b) => b.engagement.likes - a.engagement.likes);
        break;
      case 'views':
        filtered.sort((a, b) => b.engagement.views - a.engagement.views);
        break;
      case 'engagement':
        filtered.sort((a, b) => 
          (b.engagement.likes + b.engagement.comments + b.engagement.shares) - 
          (a.engagement.likes + a.engagement.comments + a.engagement.shares)
        );
        break;
      case 'time':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        break;
    }

    setBusinesses(filtered);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBusinesses(nextPage, false);
    }
  };

  // Use businesses state directly as it's already filtered
  const filteredBusinesses = businesses;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* FloatingHeader */}
        <FloatingHeader
          paragraph="Discover local businesses and services in your area"
          heading="Businesses"
          username="user"
          accountBadge={false}
          showCreateButton={true}
          onCreateClick={() => setShowCreatePostModal(true)}
        />

        {/* Search and Filters Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm mb-6">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search businesses, providers, or keywords..."
              className="w-full pl-10 pr-4 text-black py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <select
              className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <select
              className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
            >
              <option value="">All Prices</option>
              <option value="0-5000">Under ₹5,000</option>
              <option value="5000-25000">₹5,000 - ₹25,000</option>
              <option value="25000-50000">₹25,000 - ₹50,000</option>
              <option value="50000-100000">₹50,000 - ₹1,00,000</option>
              <option value="100000+">Above ₹1,00,000</option>
            </select>

            <select
              className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="likes">Most Liked</option>
              <option value="views">Most Viewed</option>
              <option value="engagement">Most Engaging</option>
              <option value="time">Recently Added</option>
            </select>

            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Businesses Grid */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">All Businesses</h2>
          <span className="text-sm text-gray-500">
            {filteredBusinesses.length} businesses found
          </span>
        </div>

        {loading && businesses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <p className="text-gray-600">Loading businesses...</p>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Businesses Found
            </h2>
            <p className="text-gray-600">
              Try adjusting your search criteria or check back later.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {filteredBusinesses.map((business) => (
                <div key={business._id} className="w-full">
                  <PostCard post={business} />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Loading..." : "Load More Businesses"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Create Post Modal */}
      {showCreatePostModal && (
        <CreatePostModal closeModal={() => setShowCreatePostModal(false)} />
      )}
    </div>
  );
};

export default BusinessesPage;
