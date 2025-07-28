"use client";

import SearchBar from "@/components/ui/SearchBar";
import { useEffect, useState } from "react";
import {
  Search,
  Users,
  Hash,
  Package,
  Building,
  ChevronDown,
  Plus,
  Calendar,
  Image,
  Film,
  Clapperboard,
  X,
} from "lucide-react";
import FloatingHeader from "@/components/FloatingHeader";
import { searchAllContent, searchUsers } from "@/api/search";
import { FeedPost, SearchUser } from "@/types";
import UserCard from "@/components/UserCard";
import TrendingTopics from "@/components/TrendingTopics";
import TrendingBusiness from "@/components/TrendingBusiness";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [activeTab, setActiveTab] = useState("All");
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [contentTypeDropdownOpen, setContentTypeDropdownOpen] = useState(false);
  const [postTypeDropdownOpen, setPostTypeDropdownOpen] = useState(false);
  const [results, setResults] = useState<FeedPost[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<string | null>("business");
  const [selectedPostType, setSelectedPostType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: "All", label: "All", icon: Search },
    { id: "Users", label: "Users", icon: Users },
    { id: "Posts", label: "Posts", icon: Hash },
  ];

  const contentTypes = [
    { id: "normal", label: "Normal", icon: Hash },
    { id: "product", label: "Product", icon: Package },
    { id: "service", label: "Service", icon: Building },
    { id: "business", label: "Business", icon: Building },
  ];

  const postTypes = [
    { id: "image", label: "Image", icon: Image },
    { id: "video", label: "Video", icon: Film },
    { id: "reel", label: "Reel", icon: Clapperboard },
  ];

  const locations = [
    "All Locations",
    "Mumbai, India",
    "Delhi, India",
    "Bangalore, India",
    "Chennai, India",
    "Kolkata, India",
    "Hyderabad, India",
    "Pune, India",
  ];

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setLocationDropdownOpen(false);
  };

  const handleContentTypeSelect = (type: string) => {
    setSelectedContentType(type === selectedContentType ? null : type);
    setContentTypeDropdownOpen(false);
  };

  const handlePostTypeSelect = (type: string) => {
    setSelectedPostType(type === selectedPostType ? null : type);
    setPostTypeDropdownOpen(false);
  };

  const clearAllFilters = () => {
    setSelectedLocation("All Locations");
    setSelectedContentType("business");
    setSelectedPostType(null);
    setStartDate(null);
    setEndDate(null);
    setActiveTab("All");
  };

  const hasActiveFilters = () => {
    return (
      selectedLocation !== "All Locations" ||
      selectedContentType !== "business" ||
      selectedPostType !== null ||
      startDate !== null ||
      endDate !== null ||
      activeTab !== "All"
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setResults([]);
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await searchAllContent(
        searchQuery,
        selectedLocation === "All Locations" ? undefined : selectedLocation,
        10,
        selectedContentType || undefined,
        selectedPostType || undefined,
        startDate ? startDate.toISOString().split('T')[0] : undefined,
        endDate ? endDate.toISOString().split('T')[0] : undefined
      );

      const flattenedResults = response.data.results.map((post) => ({
        ...post,
        username: post.userId?.username,
        profileImageUrl: post.userId?.profileImageUrl,
      }));
      setResults(flattenedResults);
      setUsers(response.data.users || []);
      setShowAllUsers(false);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to fetch results. Please try again.");
      setResults([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = async () => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await searchUsers(searchQuery);
      setUsers(response.data.users || response.data || []);
      setResults([]);
      setShowAllUsers(false);
    } catch (err) {
      console.error("Error searching users:", err);
      setError("Failed to fetch users. Please try again.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-trigger search when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        if (activeTab === "Users") {
          handleUserSearch();
        } else {
          handleSearch();
        }
      } else {
        setResults([]);
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    searchQuery,
    activeTab,
    selectedLocation,
    selectedContentType,
    selectedPostType,
    startDate,
    endDate
  ]);

  const displayedUsers = showAllUsers ? users : users.slice(0, 2);
  const hasMoreUsers = users.length > 2;

  return (
    <>
      <div className="min-h-screen flex flex-col gap-10 hide-scrollbar">
        <div className="flex-1 pr-[23rem]">
          <div className="min-w-4xl mx-auto ml-[1rem]">
            <FloatingHeader
              paragraph="Discover businesses, products, services, and more"
              heading="Search"
              username="John Doe"
              width="max-w-[54rem]"
              accountBadge={true}
            />

            <div className="w-full relative">
              <SearchBar
                value={searchQuery}
                placeholder="Search businesses, products, services..."
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
              <Button
                variant="custom"
                onClick={activeTab === "Users" ? handleUserSearch : handleSearch}
                disabled={!searchQuery.trim() || loading}
                className="absolute right-10 top-1/2 -translate-y-1/2 bg-button-gradient cursor-pointer disabled:bg-gray-300 text-white px-6 py-4 rounded-xl transition-colors flex items-center"
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters() && (
              <div className="flex justify-start mt-4">
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-yellow-600 transition-colors"
                >
                  <X size={16} />
                  Clear all filters
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-6 mt-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Advanced Search Filters */}
            <div className="flex flex-wrap gap-4 mb-8">
              {/* Location Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setLocationDropdownOpen(!locationDropdownOpen);
                    setContentTypeDropdownOpen(false);
                    setPostTypeDropdownOpen(false);
                  }}
                  disabled={loading}
                  className={`flex items-center justify-between w-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span className="truncate">{selectedLocation}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      locationDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {locationDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                    {locations.map((location) => (
                      <button
                        key={location}
                        onClick={() => handleLocationSelect(location)}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                          selectedLocation === location
                            ? "bg-yellow-50 text-yellow-800"
                            : "text-gray-700"
                        }`}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Content Type Dropdown */}
              {activeTab !== "Users" && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setContentTypeDropdownOpen(!contentTypeDropdownOpen);
                      setLocationDropdownOpen(false);
                      setPostTypeDropdownOpen(false);
                    }}
                    disabled={loading}
                    className={`flex items-center justify-between w-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <span className="truncate">
                      {selectedContentType 
                        ? contentTypes.find(t => t.id === selectedContentType)?.label || "Content Type" 
                        : "Content Type"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        contentTypeDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {contentTypeDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                      {contentTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => handleContentTypeSelect(type.id)}
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                            selectedContentType === type.id
                              ? "bg-yellow-50 text-yellow-800"
                              : "text-gray-700"
                          }`}
                        >
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Post Type Dropdown */}
              {activeTab !== "Users" && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setPostTypeDropdownOpen(!postTypeDropdownOpen);
                      setLocationDropdownOpen(false);
                      setContentTypeDropdownOpen(false);
                    }}
                    disabled={loading}
                    className={`flex items-center justify-between w-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <span className="truncate">
                      {selectedPostType 
                        ? postTypes.find(t => t.id === selectedPostType)?.label || "Post Type" 
                        : "Post Type"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        postTypeDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {postTypeDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                      {postTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => handlePostTypeSelect(type.id)}
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                            selectedPostType === type.id
                              ? "bg-yellow-50 text-yellow-800"
                              : "text-gray-700"
                          }`}
                        >
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Date Range Picker */}
              <div className={`flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}>
                <Calendar className="w-4 h-4 text-gray-500" />
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Start Date"
                  className="w-28 bg-transparent text-sm focus:outline-none text-black"
                  disabled={loading}
                />
                <span className="text-gray-400">to</span>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || undefined}
                  placeholderText="End Date"
                  className="w-28 bg-transparent text-sm focus:outline-none text-black"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Click outside to close dropdowns */}
            {(locationDropdownOpen || contentTypeDropdownOpen || postTypeDropdownOpen) && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => {
                  setLocationDropdownOpen(false);
                  setContentTypeDropdownOpen(false);
                  setPostTypeDropdownOpen(false);
                }}
              />
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 text-black">
            {/* User Cards Section */}
            {activeTab === "Users" || activeTab === "All" ? (
              <>
                {displayedUsers.map((user) => (
                  <UserCard key={user._id} user={user} />
                ))}

                {hasMoreUsers && !showAllUsers && !loading && (
                  <button
                    onClick={() => setShowAllUsers(true)}
                    className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 group"
                  >
                    <div className="flex items-center justify-center gap-3 text-gray-600 group-hover:text-yellow-600">
                      <Plus size={20} className="transition-transform group-hover:scale-110" />
                      <span className="font-medium">
                        Show {users.length - 2} more users
                      </span>
                    </div>
                  </button>
                )}

                {showAllUsers && hasMoreUsers && !loading && (
                  <button
                    onClick={() => setShowAllUsers(false)}
                    className="w-full max-w-2xl bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-3"
                  >
                    <div className="flex items-center justify-center gap-2 text-gray-600 hover:text-yellow-600">
                      <ChevronDown size={16} className="rotate-180 transition-transform" />
                      <span className="font-medium text-sm">Show less</span>
                    </div>
                  </button>
                )}
              </>
            ) : null}

            {/* Search Results - Posts */}
            {activeTab !== "Users" && (
              <>
                {results.map((item) => (
                  <div key={item._id} className="w-full max-w-2xl">
                    <PostCard post={item} />
                  </div>
                ))}
              </>
            )}

            {/* No Results Message */}
            {!loading && results.length === 0 && users.length === 0 && searchQuery.trim() && (
              <div className="text-gray-500 text-center py-8">
                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No results found</p>
                <p className="text-sm">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-[23rem] fixed p-5 right-0 top-0 h-full bg-white border-l border-gray-200 overflow-y-auto">
          <div className="mb-5">
            <TrendingTopics isSearchPage={true} />
          </div>
          <TrendingBusiness />
        </div>
      </div>
    </>
  );
}