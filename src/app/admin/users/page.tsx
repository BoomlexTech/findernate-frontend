'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import UserList from '@/components/admin/users/UserList';
import SearchBar from '@/components/admin/shared/SearchBar';
import FilterPanel from '@/components/admin/shared/FilterPanel';
import { mockUsers } from '@/data/mock/users';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesVerification = verificationFilter === 'all' || 
                               (verificationFilter === 'verified' && user.isVerified) ||
                               (verificationFilter === 'unverified' && !user.isVerified);

    return matchesSearch && matchesStatus && matchesVerification;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-2">
              Manage user accounts and permissions
            </p>
          </div>
          <button className="btn-primary">
            Export Users
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search users by name, username, or email..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <FilterPanel
            filters={[
              {
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'suspended', label: 'Suspended' },
                  { value: 'pending', label: 'Pending' },
                ]
              },
              {
                label: 'Verification',
                value: verificationFilter,
                onChange: setVerificationFilter,
                options: [
                  { value: 'all', label: 'All Users' },
                  { value: 'verified', label: 'Verified' },
                  { value: 'unverified', label: 'Unverified' },
                ]
              }
            ]}
          />
        </div>

        {/* User List */}
        <UserList users={filteredUsers} />
      </div>
    </AdminLayout>
  );
}