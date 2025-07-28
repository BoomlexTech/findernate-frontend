
import axios from './base';

export const signUp = async (data: {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  profileImageUrl?: string;
  location?: string
  link?: string;
}) => {
  const response = await axios.post('/users/register', data);
  return response.data;
};

export const VerifyOtp = async (data: {
  otp: string;
}) => {
  const response = await axios.post('/users/register/verify', data);
  return response.data;
};

export const login = async (data: {
  email: string;
  password: string;
}) => {
  const response = await axios.post('/users/login', data);
  return response.data;
};


export const logout = async () => {
  const response = await axios.post('/users/logout');
  return response.data;
};