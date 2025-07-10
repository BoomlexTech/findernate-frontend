import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

export default function ForgotPasswordComponent() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [lastPassword, setLastPassword] = useState('');

  const handleSubmit = () => {
    // Handle forgot password logic here
    console.log('Forgot password attempt:', { username, email, phoneNumber, lastPassword });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}

        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>


      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-sm mx-auto">
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                placeholder=""
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                placeholder=""
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                placeholder=""
              />
            </div>

            <div>
              <label htmlFor="lastPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Last Remembered password
              </label>
              <input
                id="lastPassword"
                type="password"
                value={lastPassword}
                onChange={(e) => setLastPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                placeholder=""
              />
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-4 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                Done
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Do not have an Account?{' '}
              <button 
                className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
                onClick={() => console.log('Sign up clicked')}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}