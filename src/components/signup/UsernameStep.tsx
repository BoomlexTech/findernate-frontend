// components/SignupFlow/UsernameStep.jsx
'use client';
import { FormEvent, useState } from 'react';
import { UsernameStepProps } from '@/types';

const UsernameStep = ({ data, updateData, onNext, onPrev }: UsernameStepProps) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleInputChange = (field: keyof typeof data, value: string) => {
    updateData({ [field]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (data.username && data.password && data.password === data.confirmPassword) {
      onNext();
    }
  };

  const passwordsMatch = data.password === data.confirmPassword;

   return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-white">
      <div className="w-full max-w-md">
        <button
          className="text-sm text-yellow-500 hover:underline mb-4"
          onClick={onPrev}
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-1">Select a Username</h1>
        <p className="text-gray-500 mb-6">Help secure your account</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Enter username"
              value={data.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? 'text' : 'password'}
                id="password"
                placeholder="Enter password"
                value={data.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                className="w-full mt-1 px-4 py-2 pr-10 border border-gray-300 rounded-md text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 text-lg"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={confirmPasswordVisible ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="Confirm password"
                value={data.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                className="w-full mt-1 px-4 py-2 pr-10 border border-gray-300 rounded-md text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 text-lg"
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              >
                {confirmPasswordVisible ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {data.confirmPassword && !passwordsMatch && (
              <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-md hover:bg-yellow-500 transition"
            disabled={!passwordsMatch}
          >
            Done
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <a href="/signin" className="text-yellow-500 hover:underline">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default UsernameStep;