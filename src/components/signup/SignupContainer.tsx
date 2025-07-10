// components/SignupFlow/SignupContainer.jsx
'use client';
import { useState } from 'react';
import PhoneStep from '@/components/signup/PhoneStep';
import OTPStep from '@/components/signup/OtpStep';
import PersonalInfoStep from '@/components/signup/PersonalInfo';
import UsernameStep from '@/components/signup/UsernameStep';
import WelcomeStep from '@/components/signup/WelcomeStep';
import { SignupData } from '@/types';

const SignupContainer = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [signupData, setSignupData] = useState<SignupData>({
    phone: '',
    countryCode: '+91',
    otp: '',
    fullName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    category: '',
    about: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const updateSignupData = (data: Partial<SignupData>) => {
    setSignupData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getProgressWidth = () => {
    return `${(currentStep / 5) * 100}%`;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PhoneStep
            data={signupData}
            updateData={updateSignupData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <OTPStep
            data={signupData}
            updateData={updateSignupData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <PersonalInfoStep
            data={signupData}
            updateData={updateSignupData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <UsernameStep
            data={signupData}
            updateData={updateSignupData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        return <WelcomeStep data={signupData} />;
      default:
        return null;
    }
  };

  return (
    <div className="signup-container">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: getProgressWidth() }}
        />
      </div>
      
      <div className="screen-container">
        {renderStep()}
      </div>
    </div>
  );
};

export default SignupContainer;