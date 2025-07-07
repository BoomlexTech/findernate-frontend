"use client";

import { Home, Search, MessageCircle, Bell, User, TrendingUp, Building, Package, Settings, Bookmark, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const navigationItems = [
  { icon: Home, label: 'Home', route: '/'},
  { icon: Search, label: 'Search', route: '/search'},
  { icon: MessageCircle, label: 'Messages', route: '/chats'},
  { icon: Bell, label: 'Notifications', route: '/notifications'},
  { icon: User, label: 'Profile', route: '/profile'},
];

const discoverItems = [
  { icon: TrendingUp, label: 'Trending' },
  { icon: Building, label: 'Businesses' },
  { icon: Package, label: 'Products' },
  { icon: Settings, label: 'Services' },
  { icon: Bookmark, label: 'Saved' },
];

export default function LeftSidebar() {

	const [isActive, setIsActive] = useState(0);
	const router = useRouter();

  return (
	<div className="p-6 h-full">
	  {/* Logo */}
	  <Link href="/">
	  <div className='sticky top-6 bg-white z-10 border-b mb-2'>
	  <div className="mb-8">
		<div className="flex items-center space-x-2 w-[13rem]">
		  <Image
		  src={'/Findernate_Logo.png'}
		  alt='Company-Logo'
		  width={220}
		  height={130}
		  className="text-xl font-bold text-gray-900 "/>
		</div>
	  </div>
	  </div>
	  </Link>

	  {/* Navigation */}
	  <nav className="mb-8">
		<ul className="space-y-2">
		  {navigationItems.map((item, index) => (
			<li key={item.label}>
			  <button
				onClick={()=> {setIsActive(index);
						router.push(item.route)}}
				className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
				  index===isActive
					? 'bg-yellow-50 text-yellow-600 border border-yellow-400 font-medium'
					: 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
				}`}
			  >
				<item.icon className="w-6 h-6" />
				<span>{item.label}</span>
			  </button>
			</li>
		  ))}
		</ul>
	  </nav>

	  {/* Create Post Button */}
	  <div className="mb-8">
		<Button variant='custom' className="flex gap-3 w-full h-[3rem] bg-[#DBB42C] hover:bg-[#DBB42C]/80 text-white font-medium py-3 rounded-xl transition-all duration-600 shadow-sm hover:shadow-md transform hover:scale-105">
		  <Plus size={20}/> Create Post
		</Button>
	  </div>

	  {/* Discover Section */}
	  <div>
		<h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
		  Discover
		</h3>
		<ul className="space-y-2">
		  {discoverItems.map((item) => (
			<li key={item.label}>
			  <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
				<item.icon className="w-6 h-6" />
				<span>{item.label}</span>
			  </button>
			</li>
		  ))}
		</ul>
	  </div>
	</div>
  );
}