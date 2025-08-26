'use client';

import AdminLayout from '@/components/admin/layout/AdminLayout';
import SearchBar from '@/components/admin/shared/SearchBar';
import FilterPanel from '@/components/admin/shared/FilterPanel';

export default function ReportsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-2">
              Review and manage user reports
            </p>
          </div>
          <button className="btn-primary">
            Export Reports
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search reports by reporter or content..."
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
                  { value: 'all', label: 'All Reports' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'reviewed', label: 'Reviewed' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'dismissed', label: 'Dismissed' },
                ]
              },
              {
                label: 'Priority',
                value: 'all',
                onChange: () => {},
                options: [
                  { value: 'all', label: 'All Priorities' },
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
                ]
              },
              {
                label: 'Type',
                value: 'all',
                onChange: () => {},
                options: [
                  { value: 'all', label: 'All Types' },
                  { value: 'spam', label: 'Spam' },
                  { value: 'harassment', label: 'Harassment' },
                  { value: 'nudity', label: 'Nudity' },
                  { value: 'violence', label: 'Violence' },
                  { value: 'fake_news', label: 'Fake News' },
                  { value: 'other', label: 'Other' },
                ]
              }
            ]}
          />
        </div>

        {/* Reports List - Placeholder */}
        <div className="card p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Reports Management</h3>
            <p className="text-gray-500">This page will display all user reports with moderation controls.</p>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>• Review reported content and users</p>
              <p>• Take action on violations</p>
              <p>• Priority-based report handling</p>
              <p>• Report analytics and trends</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}