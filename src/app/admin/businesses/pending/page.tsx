'use client';

import AdminLayout from '@/components/admin/layout/AdminLayout';
import { Search, Filter, CheckCircle, XCircle, Eye, FileText, Shield } from 'lucide-react';
import { useState } from 'react';

export default function PendingBusinessVerificationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data - will be replaced with actual API data
  const pendingBusinesses = [
    {
      id: '1',
      businessName: 'Green Energy Solutions',
      businessType: 'Renewable Energy',
      category: 'Energy & Environment',
      ownerName: 'Alex Thompson',
      email: 'alex@greenenergy.com',
      phone: '+91-9876543210',
      submittedDate: '2024-01-15',
      location: 'Bangalore, Karnataka',
      hasAadhaar: true,
      hasGST: true,
      plan: 'Premium',
      description: 'Leading provider of solar energy solutions for residential and commercial properties.'
    },
    {
      id: '2',
      businessName: 'Artisan Crafts Studio',
      businessType: 'Handicrafts',
      category: 'Arts & Crafts',
      ownerName: 'Priya Sharma',
      email: 'priya@artisancrafts.com',
      phone: '+91-8765432109',
      submittedDate: '2024-01-14',
      location: 'Jaipur, Rajasthan',
      hasAadhaar: true,
      hasGST: false,
      plan: 'Basic',
      description: 'Handmade crafts and traditional artwork by skilled artisans.'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Business Verifications</h1>
          <p className="text-gray-600 mt-2">
            Review and verify business accounts and documentation
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by business name, owner, category..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-black placeholder-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent">
            <option value="">All Categories</option>
            <option value="energy">Energy & Environment</option>
            <option value="arts">Arts & Crafts</option>
            <option value="technology">Technology</option>
            <option value="food">Food & Beverage</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <Filter className="h-4 w-4" />
            More Filters
          </button>
        </div>

        {/* Pending Businesses List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Verifications ({pendingBusinesses.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {pendingBusinesses.map((business) => (
              <div key={business.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {business.businessName}
                        </h3>
                        <p className="text-gray-600">Owner: {business.ownerName}</p>
                        <p className="text-sm text-gray-500">{business.category}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                          Pending Review
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${business.plan === 'Premium' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {business.plan}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-700">{business.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Business Type</p>
                        <p className="font-medium">{business.businessType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{business.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Submitted</p>
                        <p className="font-medium">{business.submittedDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Contact</p>
                        <p className="text-sm">{business.email}</p>
                        <p className="text-sm">{business.phone}</p>
                      </div>
                    </div>

                    {/* Document Status */}
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <Shield className={`h-4 w-4 ${business.hasAadhaar ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={`text-sm ${business.hasAadhaar ? 'text-green-600' : 'text-gray-500'}`}>
                          Aadhaar {business.hasAadhaar ? 'Provided' : 'Not Provided'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className={`h-4 w-4 ${business.hasGST ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={`text-sm ${business.hasGST ? 'text-green-600' : 'text-gray-500'}`}>
                          GST {business.hasGST ? 'Provided' : 'Not Provided'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                      <XCircle className="h-4 w-4" />
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
            Showing 1 to {pendingBusinesses.length} of {pendingBusinesses.length} results
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