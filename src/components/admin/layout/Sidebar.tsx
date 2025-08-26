'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  FileText, 
  MessageSquare, 
  Flag, 
  Building2, 
  Settings, 
  ChevronDown,
  ChevronRight,
  Home,
  Image,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: Home,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Content',
    icon: FileText,
    children: [
      { title: 'Posts', href: '/admin/posts', icon: FileText },
      { title: 'Comments', href: '/admin/comments', icon: MessageSquare },
      { title: 'Stories', href: '/admin/stories', icon: Image },
    ],
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: Flag,
  },
  {
    title: 'Businesses',
    href: '/admin/businesses',
    icon: Building2,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Activity',
    href: '/admin/activity',
    icon: Activity,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isExpanded = (title: string) => expandedItems.includes(title);

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 lg:block">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <img 
          src="/Findernate_Logo.png" 
          alt="Findernate Logo" 
          className="h-8 w-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            
            if (item.children) {
              return (
                <li key={item.title}>
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    className={cn(
                      "sidebar-item w-full justify-between",
                      isExpanded(item.title) && "bg-yellow-50 text-yellow-600"
                    )}
                  >
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 mr-3" />
                      <span>{item.title}</span>
                    </div>
                    {isExpanded(item.title) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {isExpanded(item.title) && (
                    <ul className="mt-2 ml-8 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <li key={child.title}>
                            <Link
                              href={child.href}
                              className={cn(
                                "sidebar-item text-sm",
                                isActive(child.href) && "active"
                              )}
                            >
                              <ChildIcon className="h-4 w-4 mr-3" />
                              <span>{child.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className={cn(
                    "sidebar-item",
                    isActive(item.href) && "active"
                  )}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Admin Portal v1.0
        </div>
      </div>
    </div>
  );
}