"use client";

const trendingTopics = [
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

export default function TrendingTopics() {
  const formatPosts = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="bg-gray-100 rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header with Icon */}
      <div className="flex items-center gap-2 mb-4">
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up w-5 h-5 text-gray-600"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
        <h3 className="text-lg font-semibold text-gray-900">Trending Topics</h3>
      </div>

      <div className="space-y-3">
        {trendingTopics.map((topic, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors border cursor-pointer"
          >
            <div>
              <p className="font-medium text-yellow-600 hover:text-yellow-800 transition-colors">
                {topic.hashtag}
              </p>
              <p className="text-xs text-gray-500">{formatPosts(topic.posts)} posts</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full opacity-60"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
