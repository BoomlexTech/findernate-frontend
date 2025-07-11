import { useState } from 'react';

interface FormData {
  username: string;
  email: string;
  phoneNumber: string;
  lastPassword: string;
}

interface ForgotPasswordStep1Props {
  onNext?: (data: FormData) => void;
  onBack?: () => void;
}

export default function ForgotPasswordStep1({ onNext, onBack }: ForgotPasswordStep1Props) {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    phoneNumber: '',
    lastPassword: ''
  });

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    onNext?.(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">


      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="min-w-lg mx-auto">
        <button
          className="text-sm text-yellow-500 hover:underline mb-4"
          onClick={onBack}
        >
          ← Back
        </button>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Forgot Password</h1>
          <p className="text-gray-600 mb-8">Let&apos;s help recover your account</p>

          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
              />
            </div>

            <div>
              <label htmlFor="lastPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Last Remembered password
              </label>
              <input
                id="lastPassword"
                type="password"
                value={formData.lastPassword}
                onChange={(e) => setFormData({ ...formData, lastPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
              />
            </div>

            <div className="pt-4">
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-b from-yellow-400 to-yellow-600 hover:bg-yellow-500 text-gray-900 font-medium py-4 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                Done
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Do not have an Account?{' '}
              <button className="text-yellow-600 hover:text-yellow-700 transition-colors font-medium">
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}