// Assuming you already have Tailwind CSS configured
"use client";
import React, { useState } from "react";
import { Clock, MapPin, Star, Search, Plus, Bell } from "lucide-react";

const ServicesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const services = [
    {
      id: 1,
      title: "Custom Web Development",
      description:
        "Full-stack web development with modern technologies. Includes design, development, and deployment.",
      price: 50000,
      duration: "4-6 weeks",
      location: "Bangalore, Karnataka",
      rating: 4.8,
      category: "Technology Services",
      provider: {
        name: "Rajesh Kumar",
        username: "@rajesh_tech",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      },
      image:
        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      title: "South India Cultural Tour Package",
      description:
        "Complete 4-day South India cultural experience with temple visits, beach tours, and traditional meals.",
      price: 12000,
      duration: "4 days 3 nights",
      location: "Chennai, Tamil Nadu",
      rating: 4.8,
      category: "Tourism & Travel",
      provider: {
        name: "Ananya Iyer",
        username: "@ananya_travels",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616c34f0e9f?w=150&h=150&fit=crop&crop=face",
      },
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      title: "Wedding Photography Package",
      description:
        "Complete wedding photography coverage including pre-wedding, ceremony, and reception. Includes edited photos and album.",
      price: 25000,
      duration: "Full day coverage",
      location: "Chennai, Tamil Nadu",
      rating: 4.8,
      category: "Photography & Videography",
      provider: {
        name: "Vikram Malhotra",
        username: "@vikram_photography",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      },
      image:
        "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=400&h=300&fit=crop",
    },
  ];

  const categories = [
    "Technology Services",
    "Tourism & Travel",
    "Photography & Videography",
  ];
  const locations = ["Bangalore, Karnataka", "Chennai, Tamil Nadu"];

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedLocation("");
    setSelectedPrice("");
    setSortBy("recent");
  };

  const filteredServices = services;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 py-6 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Services</h1>
            <p className="text-gray-600 text-sm">
              Discover professional services from verified businesses
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm">
              <Plus className="w-4 h-4" /> Create Post
            </button>
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">AVantika</p>
                <p className="text-xs text-gray-500">Personal Account</p>
              </div>
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">AV</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm mb-6">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services, providers, or keywords..."
              className="w-full pl-10 pr-4  text-black py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">All Services</h2>
          <span className="text-sm text-gray-500">
            {filteredServices.length * 2} services found
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...filteredServices, ...filteredServices].map((service) => (
            <div
              key={service.id + Math.random()}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md overflow-hidden"
            >
              <div className="relative">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-48 object-cover"
                />
                <span className="absolute top-3 right-3 bg-white text-sm font-semibold px-3 py-1 rounded-full">
                  ₹{service.price.toLocaleString()}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={service.provider.avatar}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {service.provider.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {service.provider.username}
                    </p>
                  </div>
                  <div className="bg-blue-500 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                </div>

                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {service.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {service.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {service.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />{" "}
                    {service.rating}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full">
                    {service.category}
                  </span>
                  <span className="text-blue-600 font-bold">
                    ₹{service.price.toLocaleString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-[#DBB42C] text-white text-sm py-2 rounded hover:bg-[#dbb42c]">
                    Book Service
                  </button>
                  <button className="text-sm px-4 py-2 text-black border rounded hover:bg-gray-50">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
