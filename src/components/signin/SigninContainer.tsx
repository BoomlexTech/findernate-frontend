'use client'
import { useState } from "react";
import ForgotPasswordStep1 from "./ForgotPassword";
import LoginComponent from "./Login";
import NewPasswordStep3 from "./NewPassword";
import OTPVerificationStep2 from "./OtpVerification";

// AuthContainer.jsx
export const SigninContainer = () => {
  const [currentView, setCurrentView] = useState('login');
  
  const renderCurrentView = () => {
    switch(currentView) {
      case 'login': return <LoginComponent onForgotPassword={() => setCurrentView('forgotPassword')} />;
      case 'forgotPassword': return <ForgotPasswordStep1 onNext={() => setCurrentView('otpVerification')} />;
      case 'otpVerification': return <OTPVerificationStep2 onNext={() => setCurrentView('newPassword')} />;
      case 'newPassword': return <NewPasswordStep3 onComplete={() => setCurrentView('login')} />;
      default: return <LoginComponent />;
    }
  };
  
  return (
    <div className="auth-container">
      {renderCurrentView()}
    </div>
  );
};