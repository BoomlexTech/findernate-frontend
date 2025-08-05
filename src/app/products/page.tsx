"use client";

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import PostCard from '@/components/PostCard';
import FloatingHeader from '@/components/FloatingHeader';
import { getExploreFeed } from '@/api/exploreFeed';
import { transformExploreFeedToFeedPost } from '@/utils/transformExploreFeed';
import { searchAllContent } from '@/api/search';
import { FeedPost } from '@/types';
import CreatePostModal from '@/components/CreatePostModal';

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [sortBy, setSortBy] = useState("likes");
  const [products, setProducts] = useState<FeedPost[]>([]);
  const [allProducts, setAllProducts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showCreatePostModal, setCreatePostModal] = useState(false);

  const categories = [
    "Electronics",
    "Fashion & Apparel", 
    "Home & Kitchen",
    "Books & Stationery",
    "Sports & Fitness",
    "Beauty & Personal Care",
    "Toys & Games",
    "Food & Beverages"
  ];

  const locations = ["Bangalore, Karnataka", "Chennai, Tamil Nadu", "Mumbai, Maharashtra", "Delhi, India"];

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedLocation("");
    setSelectedPrice("");
    setSortBy("time"); // Reset to default sort
    setIsSearchMode(false);
  };

  const fetchProducts = async (pageNum: number = 1, reset: boolean = false) => {
    setLoading(true);
    try {
      const response = await getExploreFeed({
        page: pageNum,
        limit: 20, // Fetch more data for better filtering
        types: 'product',
        sortBy: 'time' // Use consistent sorting for base data
      });
      
      const transformedData = transformExploreFeedToFeedPost(response.data.feed);
      
      if (reset) {
        setAllProducts(transformedData);
        setProducts(transformedData);
      } else {
        const newAllProducts = [...allProducts, ...transformedData];
        setAllProducts(newAllProducts);
        setProducts(newAllProducts);
      }
      
      setHasNextPage(response.data.pagination.hasNextPage);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data only once on component mount
  useEffect(() => {
    fetchProducts(1, true);
    setPage(1);
  }, []);

  // Handle search functionality
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setIsSearchMode(false);
      return;
    }

    try {
      setLoading(true);
      setIsSearchMode(true);
      
      const response = await searchAllContent(
        searchTerm,
        selectedLocation || undefined,
        20,
        "product", // Default to product content type
        undefined,
        undefined,
        undefined
      );

      const flattenedResults = response.data.results.map((post) => ({
        ...post,
        username: post.userId?.username,
        profileImageUrl: post.userId?.profileImageUrl,
      }));
      
      setProducts(flattenedResults);
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever filter criteria or data changes
  useEffect(() => {
    if (isSearchMode) return; // Don't apply local filters in search mode
    applyFilters();
  }, [searchTerm, selectedCategory, selectedLocation, selectedPrice, sortBy, allProducts, isSearchMode]);

  // Auto-trigger search when search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        setIsSearchMode(false);
        applyFilters();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedLocation]);

  const applyFilters = () => {
    let filtered = [...allProducts];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        product.contentType.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter(product => {
        if (!product.location) return false;
        
        // Handle both string and object location types
        const locationName = typeof product.location === 'string' 
          ? product.location 
          : product.location.name;
          
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

    setProducts(filtered);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, false);
    }
  };

  // Use products state directly as it's already filtered
  const filteredProducts = products;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* FloatingHeader */}
        <FloatingHeader
          paragraph="Discover amazing products from local sellers and businesses"
          heading="Products"
          username="user"
          accountBadge={false}
          showCreateButton={true}
          onCreateClick={() => {setCreatePostModal(true)}}
        />

        {/* Search and Filters Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm mb-6">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products, providers, or keywords..."
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

        {/* Products Grid */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">All Products</h2>
          <span className="text-sm text-gray-500">
            {filteredProducts.length} products found
          </span>
        </div>

        {loading && products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Products Found
            </h2>
            <p className="text-gray-600">
              Try adjusting your search criteria or check back later.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {filteredProducts.map((product) => (
                <div key={product._id} className="w-full">
                  <PostCard post={product} />
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
                  {loading ? "Loading..." : "Load More Products"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
        {/* Create Post Modal */}
      {showCreatePostModal && (
        <CreatePostModal closeModal={() => setCreatePostModal(false)} />
      )}
    </div>
  );
};

export default ProductsPage;
