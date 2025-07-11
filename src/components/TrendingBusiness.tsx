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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Business Owners</h3>
      <div className="space-y-1 max-h-80">
        {trendingBusinesses.map((business) => (
          <div
            key={business.id}
            className="flex items-center justify-start gap-6 p-2 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            <Image
            src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"
            alt='profile_pic'
            width={25}
            height={25}
            className='w-12 h-12 rounded-full object-cover'
            />
            <div className="flex flex-col gap-0">
              <p className="font-semibold text-gray-900 text-sm m-0">{business.name}</p>
              <span
                className="text-yellow-600 text-xs m-0 p-0">
                {business.category}
              </span>
              <p className="text-xs text-gray-500 m-0">
                {formatFollowers(business.followers)} followers
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
