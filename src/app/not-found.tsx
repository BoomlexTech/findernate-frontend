"use client";

import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center min-h-screen" style={{ zIndex: 99999 }}>
      {/* Main Content Container */}
      <div className="flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto">
        
        {/* FinderNate Logo */}
        <div className="mb-8">
          <Image
            src="/Findernate_Logo.png"
            alt="FinderNate Logo"
            width={150}
            height={150}
            className="mx-auto drop-shadow-lg"
            priority
          />
        </div>

        {/* Error Icon - Similar to Amazon's style */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Error Message - Matching the reference */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-3">
            Looking for something?
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            We're sorry. The Web address you entered is not a functioning page on our site.
          </p>
        </div>

        {/* Action Link - Matching Amazon's style with arrow */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-lg font-medium transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Go to FinderNate's{" "}
            <span className="text-blue-600 hover:text-blue-800 font-semibold ml-1">
              Home
            </span>{" "}
            Page
          </Link>
        </div>

        {/* Additional Quick Links */}
        <div className="border-t border-gray-200 pt-6 w-full">
          <p className="text-gray-500 text-sm mb-4">Or try these popular sections:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link 
              href="/trending" 
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Trending
            </Link>
            <Link 
              href="/marketplace" 
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Marketplace
            </Link>
            <Link 
              href="/search" 
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Search
            </Link>
            <Link 
              href="/reels" 
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Reels
            </Link>
            <Link 
              href="/businesses" 
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Businesses
            </Link>
          </div>
        </div>
      </div>

      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full opacity-30 blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-30 blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-full opacity-20 blur-3xl"></div>
      </div>
    </div>
  );
}