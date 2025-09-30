"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <html>
      <body>
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center" style={{ zIndex: 9999 }}>
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/Findernate_Logo.png"
              alt="FinderNate Logo"
              width={120}
              height={120}
              className="mx-auto"
            />
          </div>

          {/* Error Message */}
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-red-400 mb-4">Oops!</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-500 text-lg mb-8 max-w-md">
              We encountered an unexpected error. Don't worry, we're working to fix it!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Try Again
            </button>
            <button
              onClick={handleGoHome}
              className="inline-flex items-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
              Go to FinderNate's Home Page
            </button>
          </div>

          {/* Background Pattern */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100 rounded-full opacity-20"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-100 rounded-full opacity-20"></div>
          </div>
        </div>
      </body>
    </html>
  );
}