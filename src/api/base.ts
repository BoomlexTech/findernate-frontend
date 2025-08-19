
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/v1`, // from .env with fallback
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token dynamically with validation
axiosInstance.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      // Import userStore dynamically to avoid circular dependencies
      try {
        const { useUserStore } = await import('@/store/useUserStore');
        const validToken = useUserStore.getState().validateAndGetToken();
        
        if (validToken) {
          config.headers.Authorization = `Bearer ${validToken}`;
          console.log('API Request:', config.method?.toUpperCase(), config.url, 'with valid auth token');
        } else {
          console.warn('API Request:', config.method?.toUpperCase(), config.url, 'NO VALID TOKEN - may trigger logout');
        }
      } catch (error) {
        console.error('Error validating token for API request:', error);
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('API Request:', config.method?.toUpperCase(), config.url, 'with fallback token');
        }
      }
    }

    // For FormData requests, handle Content-Type properly
    if (config.data instanceof FormData) {
      // If Content-Type is explicitly set to 'multipart/form-data', let it stay
      // Otherwise, remove any default Content-Type to let browser set it automatically
      if (config.headers['Content-Type'] !== 'multipart/form-data') {
        delete config.headers['Content-Type'];
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for better error logging
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorInfo = {
      url: error?.config?.url || 'unknown',
      method: error?.config?.method?.toUpperCase() || 'unknown',
      status: error?.response?.status || 'no status',
      statusText: error?.response?.statusText || 'no status text',
      message: error?.message || 'no message',
      code: error?.code || 'no code',
      hasResponse: !!error?.response,
      hasConfig: !!error?.config,
      errorType: error?.name || 'unknown error type',
      data: undefined as unknown
    };

    // Only include response data if it exists and is not too large
    if (error?.response?.data) {
      try {
        const dataStr = JSON.stringify(error.response.data);
        if (dataStr.length < 1000) {
          errorInfo.data = error.response.data;
        } else {
          errorInfo.data = 'Response data too large to log';
        }
      } catch {
        errorInfo.data = 'Unable to stringify response data';
      }
    }

    console.error('API Error Interceptor:', errorInfo);
    
    // // Handle authentication errors
    // if (error.response?.status === 401) {
    //   console.error('Authentication Error: Token may be expired or invalid');
    //   console.log('Current token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
    //   // Trigger logout if we get a 401 error
    //   if (typeof window !== 'undefined') {
    //     import('@/store/useUserStore').then(({ useUserStore }) => {
    //       console.warn('401 error received, logging out user');
    //       useUserStore.getState().logout();
    //       window.location.href = '/signin';
    //     }).catch(err => {
    //       console.error('Failed to import userStore for logout:', err);
    //     });
    //   }
    // }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
