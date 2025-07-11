'use client'
import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff, Check, RefreshCw, ChevronDown, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { countryCodes } from '@/constants/uiItems';
import { useUserStore } from '@/store/useUserStore';
import { signUp } from '@/api/auth';
import axios from 'axios';

export default function SignupComponent() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    countryCode: '+91',
    phoneNumber: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean>(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useUserStore();
  const router = useRouter();


  const handleCountryCodeSelect = (code:string) => {
    setFormData(prev => ({
      ...prev,
      countryCode: code
    }));
    setShowCountryDropdown(false);
  };

  const selectedCountry = countryCodes.find(c => c.code === formData.countryCode);

  const handleInputChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkUsernameAvailability = () => {
    // Simulate username check
    setUsernameAvailable(true);
  };

  const handleSigninClick = () => {
    router.push('/signin')
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
        setError('');
    try {
      const response = await signUp(formData);
      console.log(response);
      setUser(response.data); // or whatever your API returns
      router.push('/')// Redirect or show success
    } catch (err) {
        if (axios.isAxiosError(err)) {
            setError(err.response?.data?.message || 'Signup failed');
        } else {
            setError('Signup failed');
        }
    }
    console.log('Zustand:', setUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4" onClick={() => setShowCountryDropdown(false)}>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Findernate</h1>
          <p className="text-gray-600">Join India&apos;s premier business platform</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name (e.g., Priya Sharma)"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pl-12 text-black placeholder:text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                required
              />
              <div className="absolute left-3 top-3.5 text-gray-400">
                    <User/>  
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username (Your Profile URL)
            </label>
            <div className="relative">
              <input
                type="text"
                name="username"
                placeholder="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pl-12 pr-20 text-black placeholder:text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                required
              />
              <div className="absolute left-3 top-3.5 text-gray-400">
                 <User/>
              </div>
              <div className="absolute right-3 top-3 flex items-center space-x-2">
                {usernameAvailable && (
                  <Check className="w-5 h-5 text-green-500" />
                )}
                <button
                  type="button"
                  onClick={checkUsernameAvailability}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Your profile will be available at: findernate.com/{formData.username || 'username'}
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <span>{selectedCountry?.country}</span>
                  <span>{selectedCountry?.code}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="9876543210"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pl-24 text-black placeholder:text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                required
              />
              
              {/* Country Code Dropdown */}
              {showCountryDropdown && (
                <div className="absolute top-14 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                  {countryCodes.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountryCodeSelect(country.code)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between text-sm"
                    >
                      <span className='text-gray-600'>{country.name}</span>
                      <span className="text-gray-500">{country.country} {country.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

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
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Create Account
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>

        {/* Already have account */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button onClick={handleSigninClick} className="text-yellow-600 hover:text-yellow-700 font-medium hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}