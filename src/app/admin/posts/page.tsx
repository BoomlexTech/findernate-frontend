'use client';

import AdminLayout from '@/components/admin/layout/AdminLayout';
import SearchBar from '@/components/admin/shared/SearchBar';
import FilterPanel from '@/components/admin/shared/FilterPanel';

export default function PostsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
            <p className="text-gray-600 mt-2">
              Manage and moderate user posts
            </p>
          </div>
          <button className="btn-primary">
            Export Posts
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search posts by content, user, or hashtags..."
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
                  { value: 'all', label: 'All Posts' },
                  { value: 'active', label: 'Active' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'rejected', label: 'Rejected' },
                ]
              },
              {
                label: 'Type',
                value: 'all',
                onChange: () => {},
                options: [
                  { value: 'all', label: 'All Types' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'service', label: 'Service' },
                  { value: 'product', label: 'Product' },
                  { value: 'business', label: 'Business' },
                ]
              }
            ]}
          />
        </div>

        {/* Posts List - Placeholder */}
        <div className="card p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Posts Management</h3>
            <p className="text-gray-500">This page will display all user posts with moderation controls.</p>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>• View post content and media</p>
              <p>• Approve, reject, or flag posts</p>
              <p>• Bulk moderation actions</p>
              <p>• Post analytics and engagement metrics</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}