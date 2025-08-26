'use client';

import AdminLayout from '@/components/admin/layout/AdminLayout';

export default function ActivityPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity</h1>
            <p className="text-gray-600 mt-2">
              Platform activity and system logs
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="btn-secondary">
              Export Logs
            </button>
            <button className="btn-primary">
              Clear Logs
            </button>
          </div>
        </div>

        {/* Activity Filters */}
        <div className="card p-6">
          <div className="flex flex-wrap gap-4">
            <select className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent">
              <option>All Activities</option>
              <option>User Actions</option>
              <option>System Events</option>
              <option>Moderation Actions</option>
              <option>Error Logs</option>
            </select>
            <select className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Custom Range</option>
            </select>
            <input
              type="text"
              placeholder="Search activities..."
              className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {/* Activity Item 1 */}
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">New user registered</p>
                  <span className="text-xs text-gray-500">2 minutes ago</span>
                </div>
                <p className="text-sm text-gray-600">John Doe joined the platform</p>
              </div>
            </div>

            {/* Activity Item 2 */}
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Post created</p>
                  <span className="text-xs text-gray-500">5 minutes ago</span>
                </div>
                <p className="text-sm text-gray-600">Sarah Jones posted about photography services</p>
              </div>
            </div>

            {/* Activity Item 3 */}
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Report submitted</p>
                  <span className="text-xs text-gray-500">10 minutes ago</span>
                </div>
                <p className="text-sm text-gray-600">Spam report for post #123</p>
              </div>
            </div>

            {/* Activity Item 4 */}
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Business verified</p>
                  <span className="text-xs text-gray-500">15 minutes ago</span>
                </div>
                <p className="text-sm text-gray-600">Tech Solutions Inc. verified successfully</p>
              </div>
            </div>

            {/* Activity Item 5 */}
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">User suspended</p>
                  <span className="text-xs text-gray-500">1 hour ago</span>
                </div>
                <p className="text-sm text-gray-600">Mike Wilson account suspended for violations</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium">
              Load more activity
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">System Status</h4>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">All systems operational</span>
            </div>
          </div>
          <div className="card p-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Active Sessions</h4>
            <div className="text-2xl font-bold text-gray-900">1,247</div>
          </div>
          <div className="card p-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Error Rate</h4>
            <div className="text-2xl font-bold text-green-600">0.02%</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}