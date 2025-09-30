"use client";

import { useState, useEffect, useRef } from 'react';
import { getPopularSearches, PopularSearch } from '@/api/search';
import { TrendingUp } from 'lucide-react';

// Fallback data for hashtag topics (non-search pages)
const fallbackTopics = [
  { hashtag: '#design', posts: 12500 },
  { hashtag: '#business', posts: 8900 },
  { hashtag: '#technology', posts: 15200 },
  { hashtag: '#health', posts: 6700 },
  { hashtag: '#travel', posts: 9800 },
  { hashtag: '#food', posts: 11300 },
  { hashtag: '#fitness', posts: 7600 },
  { hashtag: '#photography', posts: 13400 },
  { hashtag: '#marketing', posts: 5900 },
  { hashtag: '#startup', posts: 4200 }
];

interface TrendingTopicsProps {
  isSearchPage?: boolean;
  onTrendingClick?: (term: string) => void;
  onInitialLoadComplete?: () => void;
}

export default function TrendingTopics({ isSearchPage = false, onTrendingClick, onInitialLoadComplete }: TrendingTopicsProps) {
  const [searches, setSearches] = useState<PopularSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const burstTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSearchPage) {
      fetchPopularSearches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearchPage]);

  const fetchPopularSearches = async () => {
    try {
      setLoading(true);
      const response = await getPopularSearches();
      if (response.data && Array.isArray(response.data)) {
        setSearches(response.data);
      }
    } catch (error) {
      console.error('Error fetching popular searches:', error);
      setSearches([]); // Clear on error
    } finally {
      setLoading(false);
      // Notify parent that initial load is complete (success or error)
      try {
        onInitialLoadComplete?.();
      } catch {}
    }
  };

  // Clean up burst effect timeout
  useEffect(() => {
    return () => {
      if (burstTimeout.current) clearTimeout(burstTimeout.current);
    };
  }, []);

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const title = isSearchPage ? "Trending Searches" : "Trending Topics";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      {/* Modern header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-yellow-50 to-yellow-100 rounded-lg animate-pulse">
            <TrendingUp className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {isSearchPage ? (
            searches.length > 0 ? (
              searches.map((item, index) => {
                const isTop = index === 0;
                const isBurst = clickedIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setClickedIndex(index);
                      onTrendingClick?.(item.keyword);
                      if (burstTimeout.current) clearTimeout(burstTimeout.current);
                      burstTimeout.current = setTimeout(() => setClickedIndex(null), 600);
                    }}
                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-gray-50 shadow-sm transition transform-gpu cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200
                      group
                      hover:scale-[1.03] hover:shadow-lg hover:border-yellow-200
                      active:scale-[0.98]
                      ${isBurst ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}
                    `}
                    title="Click to search for this topic!"
                  >
                    <div className="min-w-0 flex items-center gap-1">
                      <div className="text-sm font-medium text-gray-800 truncate group-hover:text-yellow-700 transition-colors duration-150">
                        {item.keyword}
                      </div>
                      {isBurst && (
                        <span className="ml-1 text-yellow-500 animate-bounce text-base">✨</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-xs px-2 py-1 rounded-full font-semibold transition-all duration-200
                        bg-gray-50 text-gray-500
                        group-hover:bg-yellow-50 group-hover:text-yellow-700
                        ${isBurst ? 'scale-110 bg-yellow-200 text-yellow-800' : ''}
                      `}>
                        {formatCount(item.searchCount)}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="bg-yellow-50 rounded-full p-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-sm font-medium text-gray-800 mb-1">No trending searches yet</div>
                <div className="text-xs text-gray-400 text-center">We didn't find trending searches right now — try refreshing or come back later.</div>
              </div>
            )
          ) : (
            fallbackTopics.map((item, index) => (
              <div
                key={index}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition transform-gpu active:scale-[0.997] cursor-default"
              >
                <div className="min-w-0">
                  <div className="text-sm text-gray-800">{item.hashtag}</div>
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">{formatCount(item.posts)}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
