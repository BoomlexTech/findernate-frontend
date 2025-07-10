// components/SignupFlow/PersonalInfoStep.jsx
'use client';

import { PersonalInfoStepProps } from "@/types";
import { FormEvent } from "react";

const PersonalInfoStep = ({ data, updateData, onNext, onPrev }: PersonalInfoStepProps) => {
  const handleInputChange = (field: keyof typeof data, value: string) => {
    updateData({ [field]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (data.fullName && data.email) {
      onNext();
    }
  };

return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-white">
      <div className="w-full max-w-md">
        <button
          className="text-sm text-yellow-500 hover:underline mb-4"
          onClick={onPrev}
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-1">Personal Information</h1>
        <p className="text-gray-500 mb-6">Please fill the following details</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              placeholder="Enter your full name"
              value={data.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={data.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                value={data.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="w-1/2">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                id="gender"
                value={data.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Select Your Category
            </label>
            <select
              id="category"
              value={data.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">Choose category</option>
              <option value="student">Student</option>
              <option value="professional">Professional</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div>
            <label htmlFor="about" className="block text-sm font-medium text-gray-700">
              About
            </label>
            <textarea
              id="about"
              placeholder="Tell us about yourself"
              value={data.about}
              onChange={(e) => handleInputChange('about', e.target.value)}
              rows={3}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-md hover:bg-yellow-500 transition"
          >
            Next
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <a href="/signin" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;