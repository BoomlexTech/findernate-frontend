
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

export interface ProductDetailsFormProps {
  formData: {
      postType: string;
      mentions: string[];
      mood: string;
      activity: string;
  settings: {
    visibility: string;
    allowComments: boolean;
    allowLikes: boolean;
  };
  product: {
    name: string;
    price: string;
    currency: string;
    inStock: boolean;
  };
  status: string;
}
  
onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
categories?: string[];
}

// Regular post
export interface RegularPostPayload {
  description: string;
  location: { name: string };
  tags: string[];
  image: File[];
  postType: 'Regular';
  caption: string;
  mood: string;
  activity: string;
  mentions: string[];
  settings: {
    visibility: string;
    allowComments: boolean;
    allowLikes: boolean;
  };
  status: string;
}