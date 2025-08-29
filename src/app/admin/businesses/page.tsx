'use client';

import AdminLayout from '@/components/admin/layout/AdminLayout';
import { Search, Filter, Building2, CheckCircle, XCircle, Eye, Star, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function AllBusinessesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isVerifiedFilter, setIsVerifiedFilter] = useState('all');
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data - will be replaced with actual API data
  const businesses = [
    {
      id: '1',
      businessName: 'Tech Solutions India',
      businessType: 'Technology',
      category: 'Software Development',
      ownerName: 'Rajesh Kumar',
      email: 'rajesh@techsolutions.com',
      location: 'Bangalore, Karnataka',
      isVerified: true,
      subscriptionStatus: 'active',
      plan: 'Premium',
      createdAt: '2024-01-10T08:30:00Z',
      rating: 4.8,
      reviewsCount: 124
    },
    {
      id: '2',
      businessName: 'Artisan Crafts Studio',
      businessType: 'Handicrafts',
      category: 'Arts & Crafts',
      ownerName: 'Priya Sharma',
      email: 'priya@artisancrafts.com',
      location: 'Jaipur, Rajasthan',
      isVerified: false,
      subscriptionStatus: 'pending',
      plan: 'Basic',
      createdAt: '2024-01-08T14:20:00Z',
      rating: 4.5,
      reviewsCount: 67
    },
    {
      id: '3',
      businessName: 'Green Energy Solutions',
      businessType: 'Renewable Energy',
      category: 'Energy & Environment',
      ownerName: 'Alex Thompson',
      email: 'alex@greenenergy.com',
      location: 'Mumbai, Maharashtra',
      isVerified: true,
      subscriptionStatus: 'active',
      plan: 'Enterprise',
      createdAt: '2023-12-15T10:45:00Z',
      rating: 4.9,
      reviewsCount: 201
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getVerificationBadge = (isVerified: boolean) => {
    return isVerified ? (
      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Verified
      </span>
    ) : (
      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Unverified
      </span>
    );
  };

  const getSubscriptionBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[status as keyof typeof statusColors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const planColors = {
      Basic: 'bg-blue-100 text-blue-800',
      Premium: 'bg-purple-100 text-purple-800',
      Enterprise: 'bg-indigo-100 text-indigo-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${planColors[plan as keyof typeof planColors]}`}>
        {plan}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Businesses</h1>
          <p className="text-gray-600 mt-2">
            View and manage all business accounts on the platform
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by business name or category..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-black placeholder-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            value={isVerifiedFilter}
            onChange={(e) => setIsVerifiedFilter(e.target.value)}
          >
            <option value="all">All Verification</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified Only</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            value={subscriptionStatusFilter}
            onChange={(e) => setSubscriptionStatusFilter(e.target.value)}
          >
            <option value="all">All Subscriptions</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <Filter className="h-4 w-4" />
            More Filters
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">342</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600 mt-1">287</p>
                <p className="text-sm text-gray-500">83.9% verified</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">298</p>
                <p className="text-sm text-gray-500">87.1% active</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-100">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">28</p>
                <p className="text-sm text-gray-500">+12% growth</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-100">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Businesses List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              All Businesses ({businesses.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {businesses.map((business) => (
              <div key={business.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {business.businessName}
                        </h3>
                        <p className="text-gray-600">Owner: {business.ownerName}</p>
                        <p className="text-sm text-gray-500">{business.category}</p>
                      </div>
                      <div className="flex gap-2">
                        {getVerificationBadge(business.isVerified)}
                        {getSubscriptionBadge(business.subscriptionStatus)}
                        {getPlanBadge(business.plan)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Business Type</p>
                        <p className="font-medium">{business.businessType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{business.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <p className="font-medium">{business.rating}</p>
                          <p className="text-sm text-gray-500">({business.reviewsCount})</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-sm">{business.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Joined</p>
                        <p className="font-medium">{formatDate(business.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1 to {businesses.length} of {businesses.length} results
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button className="px-3 py-1 text-sm bg-yellow-500 text-white rounded">
              1
            </button>
            <button
              disabled
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}