'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import { Country, PhoneStepProps } from '@/types';

const PhoneStep = ({ data, updateData, onNext }: PhoneStepProps) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    code: '+91',
    flag: '🇮🇳',
    name: 'India'
  });

  const countries: Country[] = [
    { code: '+91', flag: '🇮🇳', name: 'India' },
    { code: '+1', flag: '🇺🇸', name: 'America' },
    { code: '+233', flag: '🇬🇭', name: 'Ghana' },
    { code: '+237', flag: '🇨🇲', name: 'Cameroon' },
    { code: '+227', flag: '🇳🇪', name: 'Niger' },
    { code: '+212', flag: '🇨🇦', name: 'Morocco'}
  ];

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    updateData({ countryCode: country.code });
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateData({ phone: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (data.phone.length >= 10) {
      onNext();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-white">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Phone Number</h1>
        <p className="text-gray-500 mb-6">Enter your phone number to get started</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              type="button"
              className="flex items-center px-3 bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
            >
              {selectedCountry.flag} {selectedCountry.code}
            </button>
            <input
              type="tel"
              className="flex-1 px-4 py-2 text-lg text-black placeholder-gray-400  outline-none border border-gray-200 focus:outline-none  "
              placeholder="enter a valid phone number..."
              value={data.phone}
              onChange={handlePhoneChange}
              maxLength={10}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto border p-3 rounded-md">
            {countries.map((country, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm border ${
                  selectedCountry.code === country.code
                    ? 'border-yellow-500 bg-yellow-100 font-semibold'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                <span className='text-yellow-500'>{country.flag} {country.name}</span>
                <span className="text-gray-400">{country.code}</span>
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-yellow-400 text-black font-medium rounded-md hover:bg-yellow-500 transition"
          >
            Next
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <a href="/signin" className="text-yellow-600 hover:underline">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default PhoneStep;
