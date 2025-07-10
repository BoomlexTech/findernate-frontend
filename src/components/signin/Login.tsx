import { useState } from 'react';

export default function LoginComponent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    // Handle login logic here
    console.log('Login attempt:', { username, password });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">


      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-sm mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sign In</h1>
          <p className="text-gray-600 mb-8">Enter your credentials</p>

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder=""
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder=""
              />
              <div className="text-right mt-2">
                <button 
                  type="button" 
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  onClick={() => console.log('Forgot password clicked')}
                >
                  Forgot Password?
                </button>
              </div>
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