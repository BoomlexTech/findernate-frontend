'use client';

import AdminLayout from '@/components/admin/layout/AdminLayout';
import SearchBar from '@/components/admin/shared/SearchBar';
import FilterPanel from '@/components/admin/shared/FilterPanel';

export default function CommentsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Comments</h1>
            <p className="text-gray-600 mt-2">
              Moderate user comments and replies
            </p>
          </div>
          <button className="btn-primary">
            Export Comments
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search comments by content or user..."
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
                  { value: 'all', label: 'All Comments' },
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
                  { value: 'comment', label: 'Comments' },
                  { value: 'reply', label: 'Replies' },
                ]
              }
            ]}
          />
        </div>

        {/* Comments List - Placeholder */}
        <div className="card p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Comments Management</h3>
            <p className="text-gray-500">This page will display all user comments with moderation controls.</p>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>• View comment content and context</p>
              <p>• Approve, reject, or flag comments</p>
              <p>• Bulk moderation actions</p>
              <p>• Comment analytics and engagement</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}