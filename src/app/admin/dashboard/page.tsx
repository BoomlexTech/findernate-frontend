'use client';

import { useEffect } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import StatCards from '@/components/admin/dashboard/StatCards';
import RecentActivity from '@/components/admin/dashboard/RecentActivity';
import Charts from '@/components/admin/dashboard/Charts';
import { useAdminStore } from '@/lib/store';

export default function DashboardPage() {
  const { addNotification } = useAdminStore();

  useEffect(() => {
    // Add some sample notifications
    addNotification({
      type: 'info',
      title: 'Welcome to Findernate Admin',
      message: 'You have successfully logged into the admin portal.',
    });
  }, [addNotification]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>

        {/* Stats Cards */}
        <StatCards />

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Charts />
          <RecentActivity />
        </div>
      </div>
    </AdminLayout>
  );
}