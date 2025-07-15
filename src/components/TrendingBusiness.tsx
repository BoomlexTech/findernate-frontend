'use client';
import Image from 'next/image';

const trendingBusinesses = [
  {
    id: 1,
    name: 'Green Leaf Cafe',
    username: '@greenleafcafe',
    category: 'Food & Beverage',
    followers: 25400
  },
  {
    id: 2,
    name: 'TechHub Solutions',
    username: '@techhubsol',
    category: 'Technology',
    followers: 18600
  },
  {
    id: 3,
    name: 'Fitness Plus',
    username: '@fitnessplus',
    category: 'Health & Fitness',
    followers: 32100
  },
];

export default function TrendingBusiness() {
  const formatFollowers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="bg-yellow-100 rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer">
      {/* SVG and Heading aligned */}
    <div className="flex items-center gap-2 mb-4">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-building2 text-yellow-700"
  >
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
    <path d="M10 6h4"></path>
    <path d="M10 10h4"></path>
    <path d="M10 14h4"></path>
    <path d="M10 18h4"></path>
  </svg>
  <h3 className="text-lg font-semibold text-gray-900">Trending Business Owners</h3>
</div>


      {/* Business List */}
      <div className="space-y-1 max-h-80 overflow-y-auto pr-2">
        {trendingBusinesses.map((business) => (
          <div
            key={business.id}
            className="flex items-center justify-start gap-6 p-2 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            <Image
              src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"
              alt="profile_pic"
              width={25}
              height={25}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <p className="font-semibold text-gray-900 text-sm">{business.name}</p>
              <span className="text-yellow-600 text-xs">{business.category}</span>
              <p className="text-xs text-gray-500">{formatFollowers(business.followers)} followers</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
