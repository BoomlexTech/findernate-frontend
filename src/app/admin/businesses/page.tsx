'use client';

import AdminLayout from '@/components/admin/layout/AdminLayout';
import SearchBar from '@/components/admin/shared/SearchBar';
import FilterPanel from '@/components/admin/shared/FilterPanel';

export default function BusinessesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Businesses</h1>
            <p className="text-gray-600 mt-2">
              Manage business profiles and verifications
            </p>
          </div>
          <button className="btn-primary">
            Export Businesses
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search businesses by name, category, or owner..."
              value=""
              onChange={() => {}}
            />
          </div>
          <FilterPanel
            filters={[
              {
                label: 'Status',
                value: 'all',
                onChange: () => {},
                options: [
                  { value: 'all', label: 'All Businesses' },
                  { value: 'active', label: 'Active' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'suspended', label: 'Suspended' },
                  { value: 'rejected', label: 'Rejected' },
                ]
              },
              {
                label: 'Verification',
                value: 'all',
                onChange: () => {},
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'verified', label: 'Verified' },
                  { value: 'unverified', label: 'Unverified' },
                ]
              },
              {
                label: 'Category',
                value: 'all',
                onChange: () => {},
                options: [
                  { value: 'all', label: 'All Categories' },
                  { value: 'photography', label: 'Photography' },
                  { value: 'technology', label: 'Technology' },
                  { value: 'fashion', label: 'Fashion & Jewelry' },
                  { value: 'food', label: 'Food & Beverage' },
                  { value: 'health', label: 'Health & Fitness' },
                  { value: 'design', label: 'Design & Creative' },
                  { value: 'travel', label: 'Travel & Tourism' },
                ]
              }
            ]}
          />
        </div>

        {/* Businesses List - Placeholder */}
        <div className="card p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Businesses Management</h3>
            <p className="text-gray-500">This page will display all business profiles with management controls.</p>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>• View business profiles and details</p>
              <p>• Verify business accounts</p>
              <p>• Manage business status and permissions</p>
              <p>• Business analytics and performance</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}