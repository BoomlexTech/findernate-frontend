import React from 'react';

interface RegularPostFormProps {
  formData: {
    // mood: string; // Commented out for now
    activity: string;
  };
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

// const moods = ['Happy', 'Excited', 'Relaxed', 'Grateful', 'Motivated', 'Energetic', 'Content', 'Inspired', 'Joyful']; // Commented out
const activities = ['Relaxing', 'Working', 'Travelling', 'Exercising', 'Cooking', 'Reading', 'Shopping', 'Studying', 'Socializing', 'Gaming', 'Chilling'];

const RegularPostForm: React.FC<RegularPostFormProps> = ({ formData, onChange }) => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg mb-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl text-gray-800 font-bold mb-6 flex items-center">
        <span className="w-2 h-8 bg-yellow-500 rounded-full mr-3"></span>
        Post Details
      </h3>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          What are you up to?
        </label>
        <div className="relative">
          <select
            name="activity"
            value={formData.activity}
            onChange={onChange}
            className="w-full p-4 text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-200 focus:border-yellow-500 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300 shadow-sm"
            style={{
              backgroundImage: 'none'
            }}
          >
            <option value="" className="text-gray-500 bg-gray-50 py-3 px-4">Choose your current activity...</option>
            {activities.map((activity) => (
              <option 
                key={activity} 
                value={activity}
                className="text-gray-800 bg-white hover:bg-yellow-50 py-3 px-4 border-b border-gray-100 last:border-b-0"
                style={{
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                {activity}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
            <svg 
              className="w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Commented out mood section */}
      {/* 
      <div className="mb-4">
        <label className="block text-sm font-medium text-black mb-1">Mood</label>
        <select
          name="mood"
          value={formData.mood}
          onChange={onChange}
          className="w-full p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option value="">Select your mood</option>
          {moods.map((mood) => (
            <option className='text-black' key={mood} value={mood}>{mood}</option>
          ))}
        </select>
      </div>
      */}
    </div>
  );
};

export default RegularPostForm;