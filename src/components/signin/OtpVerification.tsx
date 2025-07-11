import { useState, useEffect } from 'react';

interface OTPVerificationProps {
  onNext?: (otp: string) => void;
  onBack?: () => void;
  onResend?: () => void;
}

export default function OTPVerificationStep2({ onNext, onBack, onResend }: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);

  // Timer for OTP resend
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = () => {
    const otpString = otp.join('');
    if (otpString.length === 4) {
      console.log('OTP submitted:', otpString);
      onNext?.(otpString);
    }
  };

  const handleResendOTP = () => {
    console.log('Resending OTP...');
    setTimeLeft(60);
    setOtp(['', '', '', '']);
    onResend?.();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">


      {/* Content */}
      <div className="flex-1 px-6 py-8 flex">
        <div className="min-w-lg flex flex-col justify-center">
        <button
          className="text-sm text-yellow-500 hover:underline mb-4"
          onClick={onBack}
        >
          ← Back
        </button>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2 ml-20">OTP sent</h1>
          <p className="text-gray-600 mb-8 mx-auto">Enter the OTP sent to you</p>

          <div className="space-y-6">
            <div className="flex justify-center space-x-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(index, e)}
                  className="w-14 h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-yellow-400 text-gray-900"
                  maxLength={1}
                />
              ))}
            </div>

            <div className="text-center">
              <p className="text-gray-600">
                Didn&apos;t receive any code?{' '}
                {timeLeft > 0 ? (
                  <span className="text-red-500">Resend in {formatTime(timeLeft)}</span>
                ) : (
                  <button 
                    onClick={handleResendOTP}
                    className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
                  >
                    Resend
                  </button>
                )}
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={otp.some(digit => !digit)}
                className="w-full bg-gradient-to-b from-yellow-400 to-yellow-600 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-medium py-4 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                Next
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