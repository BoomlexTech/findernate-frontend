import type { NextPage } from 'next';
import { ChevronLeft } from 'lucide-react';

// A single, reusable plan card component
// It remains the same as it's already a well-structured component.
const PlanCard = ({ title, description, price, isPopular = false }: { title: string, description: string, price: string, isPopular?: boolean }) => (
  <div className={`bg-white p-6 rounded-2xl border shadow-sm hover:shadow-xl transition-shadow duration-300 w-full cursor-pointer flex flex-col ${isPopular ? 'border-yellow-400 border-2' : 'border-gray-200'}`}>
    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    <p className="text-gray-500 mt-2 flex-grow">{description}</p>
    <p className="text-3xl font-bold text-gray-900 mt-4">{price}</p>
  </div>
);

// The main screen component, now designed for web and responsiveness
const BusinessPlanCard: NextPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center font-sans p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex items-center mb-8">
          <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <ChevronLeft className="text-gray-700" size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-800 text-center flex-grow">
            Choose a Plan
          </h1>
        </header>

        {/* Main Content */}
        <div className="bg-yellow-50/50 rounded-3xl p-6 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center md:text-left">
              Upgrade Your Business
            </h2>

            {/* Responsive Grid for Plan Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <PlanCard
                title="Free"
                description="Basic features to get you started"
                price="Free"
              />
              <PlanCard
                title="Small Business"
                description="Enhanced analytics & promotion"
                price="₹499/month"
                isPopular={true}
              />
              <PlanCard
                title="Corporate"
                description="Priority support & advanced features"
                price="₹1,499/month"
              />
            </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPlanCard;
