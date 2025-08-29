'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/lib/store';
import Sidebar from './Sidebar';
import '@/app/admin/admin.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, user, initializeAuth } = useAdminStore();
  const router = useRouter();

  // Initialize authentication on mount
  useEffect(() => {
    console.log('🏗️ AdminLayout: Initializing auth...');
    initializeAuth();
  }, [initializeAuth]);

  // Check authentication
  useEffect(() => {
    console.log('🏗️ AdminLayout: Auth state changed - isAuthenticated:', isAuthenticated, 'user:', !!user);
    if (!isAuthenticated) {
      console.log('🏗️ AdminLayout: Not authenticated, redirecting to login...');
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    console.log('🏗️ AdminLayout: Showing loading state - isAuthenticated:', isAuthenticated, 'user:', !!user);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-6">
        <main className="min-h-screen p-6">
          {children}
        </main>
      </div>
    </div>
  );
}