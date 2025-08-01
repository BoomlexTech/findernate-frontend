
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/v1`, // from .env with fallback
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add auth token dynamically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request:', config.method?.toUpperCase(), config.url, 'with auth token');
    } else {
      console.warn('API Request:', config.method?.toUpperCase(), config.url, 'NO AUTH TOKEN');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for better error logging
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error Interceptor:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      baseURL: error.config?.baseURL,
      message: error.message,
      code: error.code,
      headers: error.response?.headers,
      fullError: error
    });
    
    // Special logging for authentication errors
    if (error.response?.status === 401) {
      console.error('Authentication Error: Token may be expired or invalid');
      console.log('Current token:', localStorage.getItem('token') ? 'Present' : 'Missing');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
