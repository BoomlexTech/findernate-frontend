'use client';

import AdminLayout from '@/components/admin/layout/AdminLayout';
import SearchBar from '@/components/admin/shared/SearchBar';
import FilterPanel from '@/components/admin/shared/FilterPanel';

export default function StoriesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stories</h1>
            <p className="text-gray-600 mt-2">
              Manage user stories and temporary content
            </p>
          </div>
          <button className="btn-primary">
            Export Stories
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search stories by user or content..."
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
                  { value: 'all', label: 'All Stories' },
                  { value: 'active', label: 'Active' },
                  { value: 'expired', label: 'Expired' },
                  { value: 'flagged', label: 'Flagged' },
                ]
              },
              {
                label: 'Type',
                value: 'all',
                onChange: () => {},
                options: [
                  { value: 'all', label: 'All Types' },
                  { value: 'image', label: 'Image' },
                  { value: 'video', label: 'Video' },
                  { value: 'text', label: 'Text' },
                ]
              }
            ]}
          />
        </div>

        {/* Stories Grid - Placeholder */}
        <div className="card p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Stories Management</h3>
            <p className="text-gray-500">This page will display all user stories with moderation controls.</p>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>• View story content and media</p>
              <p>• Flag inappropriate stories</p>
              <p>• Story analytics and views</p>
              <p>• Expiration time tracking</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}