"use client";

import SearchBar from "@/components/ui/SearchBar";
import { useEffect, useState } from "react";
import {
  Search,
  Users,
  Hash,
  Package,
  Building,
  Tag,
  ChevronDown,
  Plus,
} from "lucide-react";
import FloatingHeader from "@/components/FloatingHeader";
import { searchAllContent, searchUsers } from "@/api/search";
import { FeedPost, SearchUser } from "@/types";
import UserCard from "@/components/UserCard";
import TrendingTopics from "@/components/TrendingTopics";
import TrendingBusiness from "@/components/TrendingBusiness";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [activeTab, setActiveTab] = useState("All");
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [results, setResults] = useState<FeedPost[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);

  const tabs = [
    { id: "All", label: "All", icon: Search },
    { id: "Users", label: "Users", icon: Users },
    { id: "Posts", label: "Posts", icon: Hash },
    { id: "Products", label: "Products", icon: Package },
    { id: "Services", label: "Services", icon: Building },
    { id: "Tags", label: "Tags", icon: Tag },
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

  const categories = [
    "All Categories",
    "Fashion & Apparel",
    "Food & Beverages",
    "Technology",
    "Health & Wellness",
    "Home & Garden",
    "Sports & Fitness",
    "Arts & Crafts",
    "Education",
    "Travel & Tourism",
  ];

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setLocationDropdownOpen(false);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCategoryDropdownOpen(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return; // Don't search empty queries
    const response = await searchAllContent(
      searchQuery,
      selectedLocation === "All Locations" ? undefined : selectedLocation,
      10
    );
    const flattenedResults = response.data.results.map((post) => ({
      ...post,
      username: post.userId?.username,
      profileImageUrl: post.userId?.profileImageUrl,
    }));
    setResults(flattenedResults);
    setUsers(response.data.users);
    setShowAllUsers(false); // Reset to show only 2 users on new search
    console.log(response.data);
  };

  // Handle user search when Users tab is selected
  const handleUserSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await searchUsers(searchQuery);
      setUsers(response.data.users || response.data || []); // Adjust based on your API response structure
      setResults([]); // Clear posts when searching users only
      setShowAllUsers(false);
      console.log("User search results:", response.data);
    } catch (error) {
      console.error("Error searching users:", error);
      setUsers([]);
    }
  };

  // UseEffect to handle Users tab selection
  useEffect(() => {
    if (activeTab === "Users" && searchQuery.trim()) {
      handleUserSearch();
    }
  }, [activeTab]);

  // Remove automatic search on typing
  useEffect(() => {
    // Only search when location changes, not on every keystroke
    if (searchQuery) {
      // Don't auto-search on typing
    }
  }, [selectedLocation]);

  // Get users to display (2 initially, all when showAllUsers is true)
  const displayedUsers = showAllUsers ? users : users.slice(0, 2);
  const hasMoreUsers = users.length > 2;

  return (
    <>
      <div className="min-h-screen flex flex-col gap-10 hide-scrollbar">
        <div className="flex-1 pr-[23rem]">
          <div className="min-w-4xl mx-auto ml-[1rem]">
            {/* Search Header */}
            <FloatingHeader
              paragraph="Discover businesses, products, services, and more"
              heading="Search"
              username="John Doe"
              width="max-w-[54rem]"
              accountBadge={true}
            />

            <div className="w-full relative" onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter') {
                if (activeTab === "Users") {
                  handleUserSearch();
                } else {
                  handleSearch();
                }
              }
            }}>
              <SearchBar
                value={searchQuery}
                placeholder="Search businesses, products, services..."
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
              />
              <Button
                variant="custom"
                onClick={activeTab === "Users" ? handleUserSearch : handleSearch}
                disabled={!searchQuery.trim()}
                className="absolute right-10 top-1/2 -translate-y-1/2 bg-button-gradient cursor-pointer disabled:bg-gray-300 text-white px-6 py-4 rounded-xl transition-colors flex items-center"
              >
                Search
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 mt-10">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {setActiveTab(tab.id); handleSearch(); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
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
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      categoryDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategorySelect(category)}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                          selectedCategory === category
                            ? "bg-yellow-50 text-yellow-800"
                            : "text-gray-700"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
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

          <div className="flex flex-col items-center gap-4 text-black">
            {/* User Cards Section */}
            {displayedUsers.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}

            {/* Show More Users Button */}
            {hasMoreUsers && !showAllUsers && (
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

            {/* Show Less Button (when all users are shown) */}
            {showAllUsers && hasMoreUsers && (
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

            {/* Search Results - Posts (only show when not in Users tab) */}
            {activeTab !== "Users" && results.map((item) => (
              <div key={item._id} className="w-full max-w-2xl">
                <PostCard post={item} />
              </div>
            ))}

            {/* No Results Message */}
            {results.length === 0 && users.length === 0 && (
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
            <TrendingTopics />
          </div>
          <TrendingBusiness />
        </div>
      </div>
    </>
  );
}