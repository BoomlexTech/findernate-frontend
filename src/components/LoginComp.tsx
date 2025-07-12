'use client'
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginComponentProps {
  onLogin?: (data: LoginFormData) => void;
  onCreateAccount?: () => void;
}

const LoginComponent: React.FC<LoginComponentProps> = ({ 
  onLogin
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onCreateAccount = () => {
    router.push('/signup');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (onLogin) {
         onLogin(formData);
      }
      console.log('Login submitted:', formData);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
      router.push('/')
    }
  };

  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">F</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Findernate</h1>
          <p className="text-gray-600">Welcome back to your business network</p>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          {/* Email */}
          <div>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pl-12 text-black placeholder:text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                required
              />
              <div className="absolute left-3 top-3.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pl-12 pr-12 text-black placeholder:text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                required
              />
              <div className="absolute left-3 top-3.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        {/* Create Account Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <button 
              onClick={onCreateAccount}
              className="text-yellow-600 hover:text-yellow-700 font-medium hover:underline transition-colors"
            >
              Create Account
            </button>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-yellow-800">Demo Credentials:</h3>
    
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-yellow-700">
              <span className="font-medium">Email:</span> priya@example.com
            </p>
            <p className="text-yellow-700">
              <span className="font-medium">Password:</span> password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;