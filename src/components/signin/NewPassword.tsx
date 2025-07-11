import { useState } from 'react';

interface PasswordData {
  newPassword: string;
  confirmPassword: string;
}

interface NewPasswordStep3Props {
  onComplete?: (data: PasswordData) => void;
  onBack?: () => void;
}

export default function NewPasswordStep3({ onComplete }: NewPasswordStep3Props) {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validatePasswords = (): boolean => {
    const newErrors: typeof errors = {};

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validatePasswords()) {
      console.log('Password reset successful:', passwordData);
      onComplete?.(passwordData);
    }
  };

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
 

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="min-w-lg mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Pick a new Password</h1>
          <p className="text-gray-600 mb-8">Help secure your account</p>

          <div className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your new password"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm new Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-900 mb-2">Password Requirements:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    passwordData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></span>
                  At least 8 characters
                </li>
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    /[A-Z]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                  }`}></span>
                  One uppercase letter
                </li>
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    /[a-z]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                  }`}></span>
                  One lowercase letter
                </li>
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    /\d/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                  }`}></span>
                  One number
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={!passwordData.newPassword || !passwordData.confirmPassword}
                className="w-full bg-gradient-to-b from-yellow-400 to-yellow-600 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-medium py-4 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
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