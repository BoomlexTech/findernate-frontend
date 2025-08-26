'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/lib/store';
import Sidebar from './Sidebar';
import Header from './Header';
import '@/app/admin/admin.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, user } = useAdminStore();
  const router = useRouter();

  // Temporarily disable authentication check
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push('/admin/login');
  //   }
  // }, [isAuthenticated, router]);

  // if (!isAuthenticated || !user) {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-48">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}