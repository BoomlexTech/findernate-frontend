'use client'
import React, { ReactNode } from 'react';
import { DEFAULT_ONBOARDING_ITEMS } from '@/constants/uiItems';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface onboardingScreenProps {
  title: string;
  description: string;
  floatingIcons?: ReactNode[];
  primaryButtonText: string;
  onPrimaryClick?: ()=> void;
  showSkipButton?: boolean;
  onSkipClick?: ()=> void;
  footerText: string;
  onFooterClick: () => void;
  backgroundColor: string;
}

const OnboardingScreen = ({
  title,
  description,
  floatingIcons = [],
  primaryButtonText = "Next",
  showSkipButton = true,
  footerText,
  onFooterClick,
}: onboardingScreenProps) => {

  const router = useRouter();

  floatingIcons = [
    "emojisix.svg",
    "emoji.svg",
    "emojifour.svg",
    "emojifive.svg",
    "PartyIcon.svg",
    "emojithree.svg",
    ]

    const handlePrimaryClick = () => {
      router.push('/signup');
    }
    const handleSkipClick = () => {
      router.push('/signup');
    }

  return (
    <div className={`min-h-screen bg-white flex`}>
      {/* Left Section - Illustration */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="relative w-full max-w-lg">
          {/* Floating Icons Container */}
          <div className="relative w-96 h-96 mx-auto">
            {/* Center Circle with Icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-400 rounded-full flex items-center justify-center text-6xl z-10 shadow-lg">
                   <Image
                    width={100}
                    height={100}
                    src="/icons/emojitwo.svg"
                    alt="Center Icon"
                    className="w-3/4 h-3/4 object-contain"
                  />
            </div>
            
            {/* Floating Icons positioned around the circle */}
            {floatingIcons?.map((iconName, index) => {
              const positions = [
                { top: '5%', left: '5%', size: 'w-10 h-10' },
                { top: '8%', right: '20%', size: 'w-15 h-15' },
                { top: '35%', left: '2%', size: 'w-18 h-18' },
                { top: '55%', right: '3%', size: 'w-12 h-12' },
                { bottom: '15%', left: '2%', size: 'w-10 h-10' },
                { bottom: '5%', right: '10%', size: 'w-12 h-12' },
                { top: '25%', left: '0%', size: 'w-10 h-10' },
                { bottom: '8%', left: '12%', size: 'w-13 h-13' }
              ];
              
              const position = positions[index % positions.length];
              const { size, ...positionStyle } = position;
              
              return (
                <div
                  key={index}
                  className={`absolute ${size} bg-yellow-300 rounded-full flex items-center justify-center text-2xl shadow-md hover:scale-110 transition-transform duration-300`}
                  style={positionStyle}
                >
            <Image
              width={40}
              height={40}
              src={`/icons/${iconName}`}
              alt={`Floating Icon ${index}`}
              className="w-3/4 h-3/4 object-contain"
            />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Section - Content */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 bg-white">
        <div className="max-w-md mx-auto w-full">
          {/* Text Content */}
          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {title || DEFAULT_ONBOARDING_ITEMS.title}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {description || DEFAULT_ONBOARDING_ITEMS.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            {/* Primary Button */}
            <button
              onClick={handlePrimaryClick}
              className="w-full bg-yellow-400 text-black font-semibold py-4 px-8 rounded-lg hover:bg-yellow-500 transition-colors duration-200 text-lg shadow-sm"
            >
              {primaryButtonText || DEFAULT_ONBOARDING_ITEMS.primaryButtonText}
            </button>

            {/* Skip Button (Optional) */}
            {showSkipButton && (
              <button
                onClick={handleSkipClick}
                className="w-full bg-transparent border border-gray-300 text-gray-700 font-medium py-4 px-8 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-lg"
              >
                Skip
              </button>
            )}
          </div>

          {/* Footer Text (Optional) */}
          {
            <div className="text-center">
              <button
                onClick={onFooterClick}
                className="text-gray-500 text-base hover:text-gray-700 transition-colors duration-200"
              >
                {footerText || DEFAULT_ONBOARDING_ITEMS.footerText}
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen