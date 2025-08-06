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
  MapPin,
  Crosshair,
  Filter,
  Sparkles,
  TrendingUp,
  Flame,
  Star,
} from "lucide-react";
import FloatingHeader from "@/components/FloatingHeader";
import { searchAllContent, searchUsers } from "@/api/search";
import { FeedPost, SearchUser } from "@/types";
import UserCard from "@/components/UserCard";
import TrendingTopics from "@/components/TrendingTopics";
import TrendingBusiness from "@/components/TrendingBusiness";
import PostCard from "@/components/PostCard";
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
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  const [selectedPostType, setSelectedPostType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [currentCoordinates, setCurrentCoordinates] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(5);

  const tabs = [
    { id: "All", label: "All", icon: Search },
    { id: "Users", label: "Users", icon: Users },
    { id: "Posts", label: "Posts", icon: Hash },
  ];

  const contentTypes = [
    { id: "all", label: "All", icon: Search },
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
    "Mumbai",
    "Delhi", 
    "Bangalore",
    "Bengaluru",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Pune",
    "Mumbai, India",
    "Delhi, India",
    "Bangalore, India",
    "Chennai, India",
    "Kolkata, India",
    "Hyderabad, India",
    "Pune, India",
  ];

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentCoordinates(`${longitude}|${latitude}`);
          setUseCurrentLocation(true);
          setSelectedLocation("Current Location");
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Unable to get your current location. Please allow location access.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const handleLocationSelect = (location: string) => {
    if (location === "Current Location") {
      getCurrentLocation();
    } else {
      setSelectedLocation(location);
      setUseCurrentLocation(false);
      setCurrentCoordinates(null);
    }
    setLocationDropdownOpen(false);
  };

  const handleContentTypeSelect = (type: string) => {
    if (type === "all") {
      setSelectedContentType(null);
    } else {
      setSelectedContentType(type === selectedContentType ? null : type);
    }
    setContentTypeDropdownOpen(false);
  };

  const handlePostTypeSelect = (type: string) => {
    setSelectedPostType(type === selectedPostType ? null : type);
    setPostTypeDropdownOpen(false);
  };

  const clearAllFilters = () => {
    setSelectedLocation("All Locations");
    setSelectedContentType(null);
    setSelectedPostType(null);
    setStartDate(null);
    setEndDate(null);
    setActiveTab("All");
    setUseCurrentLocation(false);
    setCurrentCoordinates(null);
    setSearchRadius(5);
  };

  const hasActiveFilters = () => {
    return (
      selectedLocation !== "All Locations" ||
      selectedContentType !== null ||
      selectedPostType !== null ||
      startDate !== null ||
      endDate !== null ||
      activeTab !== "All" ||
      useCurrentLocation ||
      searchRadius !== 5
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

      const locationParam = !useCurrentLocation && selectedLocation !== "All Locations" 
        ? selectedLocation.split(',')[0].toLowerCase().trim()
        : undefined;

      const response = await searchAllContent(
        searchQuery,
        locationParam,
        10,
        selectedContentType === "all" ? undefined : selectedContentType || undefined,
        selectedPostType || undefined,
        startDate ? startDate.toISOString().split('T')[0] : undefined,
        endDate ? endDate.toISOString().split('T')[0] : undefined,
        useCurrentLocation && currentCoordinates ? searchRadius : undefined,
        useCurrentLocation && currentCoordinates ? currentCoordinates : undefined
      );

      let filteredResults = response.data.results || [];
      let filteredUsers = response.data.users || [];

      if (!useCurrentLocation && selectedLocation !== "All Locations") {
        filteredResults = filteredResults.filter((post) => {
          const postLocation = post.customization?.normal?.location?.name || 
                               post.customization?.product?.location?.name ||
                               post.customization?.service?.location?.name ||
                               post.customization?.business?.location?.name;
          
          if (postLocation) {
            const normalizedPostLocation = postLocation.toLowerCase().trim();
            const normalizedSelectedLocation = selectedLocation.toLowerCase().trim();
            const selectedCity = selectedLocation.split(',')[0].toLowerCase().trim();
            
            const isMatch = normalizedPostLocation.includes(selectedCity) ||
                           normalizedSelectedLocation.includes(normalizedPostLocation) ||
                           normalizedPostLocation === normalizedSelectedLocation ||
                           normalizedPostLocation.includes(normalizedSelectedLocation) ||
                           selectedCity === normalizedPostLocation;
            
            return isMatch;
          }
          return false;
        });

        filteredUsers = filteredUsers.filter((user) => {
          if (user.location) {
            const normalizedUserLocation = user.location.toLowerCase().trim();
            const normalizedSelectedLocation = selectedLocation.toLowerCase().trim();
            const selectedCity = selectedLocation.split(',')[0].toLowerCase().trim();
            
            const isMatch = normalizedUserLocation.includes(selectedCity) ||
                           normalizedSelectedLocation.includes(normalizedUserLocation) ||
                           normalizedUserLocation === normalizedSelectedLocation ||
                           selectedCity === normalizedUserLocation;
            
            return isMatch;
          }
          return false;
        });
      }

      const flattenedResults = filteredResults.map((post) => ({
        ...post,
        username: post.userId?.username,
        profileImageUrl: post.userId?.profileImageUrl,
      }));
      
      setResults(flattenedResults);
      setUsers(filteredUsers);
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
    endDate,
    useCurrentLocation,
    currentCoordinates,
    searchRadius
  ]);

  const displayedUsers = showAllUsers ? users : users.slice(0, 2);
  const hasMoreUsers = users.length > 2;

  const handleTrendingClick = (term: string) => {
    setSearchQuery(term);
  };

  // Handler for updating local state when follow status changes
  const handleFollowUpdate = (userId: string) => {
    // Update the local users state to reflect the change
    const userIndex = users.findIndex(user => user._id === userId);
    if (userIndex !== -1) {
      const updatedUsers = [...users];
      const currentUser = updatedUsers[userIndex];
      
      // Toggle the follow status and update follower count
      const newIsFollowing = !currentUser.isFollowing;
      updatedUsers[userIndex] = {
        ...currentUser,
        isFollowing: newIsFollowing,
        followersCount: newIsFollowing 
          ? (currentUser.followersCount || 0) + 1 
          : Math.max((currentUser.followersCount || 0) - 1, 0) // Don't go below 0
      };
      setUsers(updatedUsers);
      
      console.log(`Updated user ${userId} follow status to: ${newIsFollowing}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col gap-10 hide-scrollbar">
      <div className="flex-1 xl:pr-[23rem] px-4 xl:px-0">
        <div className="max-w-full xl:max-w-4xl mx-auto xl:ml-4">
          <div className="[&>*]:!max-w-full [&>*]:xl:!max-w-[54rem]">
            <FloatingHeader
              paragraph="Discover businesses, products, services, and more"
              heading="Search"
              username="John Doe"
              width="w-full"
              accountBadge={true}
            />
          </div>

          <div className="w-full relative [&>*]:!max-w-full [&>*]:xl:!max-w-[54rem]">
            <SearchBar
              value={searchQuery}
              placeholder="Search businesses, products, services..."
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mt-4 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={loading}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-sm border ${
                    activeTab === tab.id
                      ? 'bg-button-gradient text-white shadow-lg transform scale-105 border-yellow-300'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:scale-105'
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Advanced Filters Grid */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Location Filter */}
              <select
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={selectedLocation}
                onChange={(e) => {
                  if (e.target.value === "Current Location") {
                    getCurrentLocation();
                  } else {
                    setSelectedLocation(e.target.value);
                    setUseCurrentLocation(false);
                    setCurrentCoordinates(null);
                  }
                }}
                disabled={loading}
              >
                <option value="All Locations">All Locations</option>
                <option value="Current Location">Current Location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>

              {/* Content Type Filter */}
              {activeTab !== "Users" && (
                <select
                  className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedContentType || ""}
                  onChange={(e) => setSelectedContentType(e.target.value || null)}
                  disabled={loading}
                >
                  <option value="">All Content Types</option>
                  {contentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Post Type Filter */}
              {activeTab !== "Users" && (
                <select
                  className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedPostType || ""}
                  onChange={(e) => setSelectedPostType(e.target.value || null)}
                  disabled={loading}
                >
                  <option value="">All Post Types</option>
                  {postTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Date Range Filter */}
              <div className="flex gap-2">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="From"
                  className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={loading}
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || undefined}
                  placeholderText="To"
                  className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={loading}
                />
              </div>

              {/* Radius Slider - Only show when using current location */}
              {useCurrentLocation && (
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Radius:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="200"
                      value={searchRadius}
                      onChange={(e) => setSearchRadius(Number(e.target.value))}
                      disabled={loading}
                      className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #eab308 0%, #eab308 ${((searchRadius - 1) / 199) * 100}%, #e5e7eb ${((searchRadius - 1) / 199) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <span className="text-sm font-medium text-gray-900 min-w-[30px]">{searchRadius}km</span>
                  </div>
                </div>
              )}

              {/* Clear Filters Button */}
              {hasActiveFilters() && (
                <button
                  onClick={clearAllFilters}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Search Results Info */}
          {searchQuery.trim() && !loading && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800 font-medium">
                    {results.length > 0 || users.length > 0 ? (
                      <>
                        Found {results.length} posts and {users.length} users
                        {selectedLocation !== "All Locations" && !useCurrentLocation && (
                          <span className="text-blue-600"> in {selectedLocation}</span>
                        )}
                        {useCurrentLocation && (
                          <span className="text-blue-600"> within {searchRadius}km of your location</span>
                        )}
                      </>
                    ) : (
                      <>
                        No results found for "{searchQuery}"
                        {selectedLocation !== "All Locations" && !useCurrentLocation && (
                          <span> in {selectedLocation}</span>
                        )}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
          )}

          <div className="flex flex-col items-center gap-4 text-black">
            {/* User Cards Section */}
            {activeTab === "Users" || activeTab === "All" ? (
              <>
                {displayedUsers.map((user) => (
                  <UserCard key={user._id} user={user} onFollow={handleFollowUpdate} />
                ))}

                {hasMoreUsers && !showAllUsers && !loading && (
                  <button
                    onClick={() => setShowAllUsers(true)}
                    className="w-full bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 group"
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
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-3"
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
                  <PostCard key={item._id} post={item} />
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

        <div className="hidden xl:block w-[23rem] fixed p-5 right-0 top-0 h-full bg-white border-l border-gray-200 overflow-y-auto">
          <div className="mb-5">
            <TrendingTopics isSearchPage={true} onTrendingClick={handleTrendingClick} />
          </div>
          <TrendingBusiness />
        </div>
      </div>
    </div>
  );
}