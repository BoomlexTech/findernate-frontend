import React from 'react';

interface RegularPostFormProps {
  formData: {
    mood: string;
    activity: string;
  };
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const moods = ['Happy', 'Excited', 'Relaxed', 'Grateful', 'Motivated', 'Energetic', 'Content', 'Inspired', 'Joyful'];
const activities = ['Relaxing', 'Working', 'Travelling', 'Exercising', 'Cooking', 'Reading', 'Shopping', 'Studying', 'Socializing', 'Gaming', 'Chilling'];

const RegularPostForm: React.FC<RegularPostFormProps> = ({ formData, onChange }) => {
  return (
    <div className="bg-gray-100 p-6 rounded-xl shadow-md mb-6 border-2 border-yellow-500">
      <h3 className="text-lg text-black font-semibold mb-4"> Post Details</h3>

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

      <div>
        <label className="block text-sm font-medium text-black mb-1">Activity</label>
        <select
          name="activity"
          value={formData.activity}
          onChange={onChange}
          className="w-full p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option value="">Select your activity</option>
          {activities.map((activity) => (
            <option className='text-black' key={activity} value={activity}>{activity}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RegularPostForm;
