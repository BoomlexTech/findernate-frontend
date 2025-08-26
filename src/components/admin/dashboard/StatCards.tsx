'use client';

import { Users, FileText, Flag, Building2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

const stats = [
  {
    title: 'Total Users',
    value: '2,250',
    change: '+12.5%',
    changeType: 'increase',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    title: 'Total Posts',
    value: '1,089',
    change: '+8.2%',
    changeType: 'increase',
    icon: FileText,
    color: 'bg-green-500',
  },
  {
    title: 'Pending Reports',
    value: '8',
    change: '-15.3%',
    changeType: 'decrease',
    icon: Flag,
    color: 'bg-red-500',
  },
  {
    title: 'Active Businesses',
    value: '156',
    change: '+5.7%',
    changeType: 'increase',
    icon: Building2,
    color: 'bg-purple-500',
  },
];

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.title} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'increase' ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}