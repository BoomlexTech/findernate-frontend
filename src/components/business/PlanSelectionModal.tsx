import React from "react";

type PlanSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: (plan: string) => void; // Optional: callback for plan selection
  currentPlan?: string; // Optional: to highlight the current plan
};

const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  currentPlan = "Free",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-4xl w-full p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-center text-black mb-6">Choose Your Plan</h2>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className="border rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-black">Free</h3>
            <p className="text-2xl font-bold my-2 text-black">₹0</p>
            <p className="text-sm text-gray-500 mb-4">/Forever</p>
            <ul className="text-sm text-left space-y-2 mb-6 text-black">
              <li><span className='text-green-500 text-xl'>✔</span> Basic business profile</li>
              <li><span className='text-green-500 text-xl'>✔</span> Up to 10 posts per month</li>
              <li><span className='text-green-500 text-xl'>✔</span> Basic analytics</li>
              <li><span className='text-green-500 text-xl'>✔</span>Community support</li>
            </ul>
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-default"
              disabled={currentPlan === "Free"}
              onClick={() => onSelectPlan && onSelectPlan("Free")}
            >
              {currentPlan === "Free" ? "Current Plan" : "Choose Free"}
            </button>
          </div>

          {/* Small Business Plan */}
          <div className="border-2 border-yellow-400 bg-yellow-50 rounded-lg p-6 text-center relative">
            <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full">
              Most Popular
            </span>
            <h3 className="text-xl font-semibold text-black">Small Business</h3>
            <p className="text-2xl font-bold my-2 text-black">₹999</p>
            <p className="text-sm text-gray-500 mb-4">/per month</p>
            <ul className="text-sm text-left space-y-2 mb-6 text-black">
              <li><span className='text-green-500 text-xl'>✔</span> Enhanced business profile</li>
              <li><span className='text-green-500 text-xl'>✔</span> Unlimited posts</li>
              <li><span className='text-green-500 text-xl'>✔</span> Advanced analytics</li>
              <li><span className='text-green-500 text-xl'>✔</span> Product catalog (up to 50 items)</li>
              <li><span className='text-green-500 text-xl'>✔</span> Priority support</li>
              <li><span className='text-green-500 text-xl'>✔</span> Basic advertising tools</li>
            </ul>
            <button
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
              disabled={currentPlan === "Small Business"}
              onClick={() => onSelectPlan && onSelectPlan("Small Business")}
            >
              {currentPlan === "Small Business" ? "Current Plan" : "Upgrade Now"}
            </button>
          </div>

          {/* Corporate Plan */}
          <div className="border rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-black">Corporate</h3>
            <p className="text-2xl font-bold my-2 text-black">₹2999</p>
            <p className="text-sm text-gray-500 mb-4">/per month</p>
            <ul className="text-sm text-left space-y-2 mb-6 text-black">
              <li><span className='text-green-500 text-xl'>✔</span> Premium business profile</li>
              <li><span className='text-green-500 text-xl'>✔</span> Unlimited everything</li>
              <li><span className='text-green-500 text-xl'>✔</span> Advanced analytics & insights</li>
              <li><span className='text-green-500 text-xl'>✔</span> Unlimited product catalog</li>
              <li><span className='text-green-500 text-xl'>✔</span> Dedicated account manager</li>
              <li><span className='text-green-500 text-xl'>✔</span> Advanced advertising & promotion</li>
              <li><span className='text-green-500 text-xl'>✔</span> API access</li>
              <li><span className='text-green-500 text-xl'>✔</span> White-label options</li>
            </ul>
            <button
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
              disabled={currentPlan === "Corporate"}
              onClick={() => onSelectPlan && onSelectPlan("Corporate")}
            >
              {currentPlan === "Corporate" ? "Current Plan" : "Upgrade Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelectionModal;