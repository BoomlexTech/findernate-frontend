
// types/signup.ts
export interface SignupData {
  phone: string;
  countryCode: string;
  otp: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  category: string;
  about: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface Country {
  code: string;
  flag: string;
  name: string;
}

export interface BaseStepProps {
  data: SignupData;
  updateData: (data: Partial<SignupData>) => void;
  onNext: () => void;
}

export interface StepWithBackProps extends BaseStepProps {
  onPrev: () => void;
}

export type PhoneStepProps = BaseStepProps 

export type OTPStepProps = StepWithBackProps 

export type PersonalInfoStepProps = StepWithBackProps 

export type UsernameStepProps = StepWithBackProps 

export interface WelcomeStepProps {
  data: SignupData;
}