
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
    // Safely extract error information to avoid circular reference issues
    let errorInfo;
    try {
      errorInfo = {
        url: error.config?.url || 'unknown',
        method: error.config?.method?.toUpperCase() || 'unknown',
        status: error.response?.status || 'unknown',
        statusText: error.response?.statusText || 'unknown',
        data: error.response?.data || 'no data',
        baseURL: error.config?.baseURL || 'unknown',
        message: error.message || 'no message',
        code: error.code || 'no code',
        // Don't include headers as they might cause circular reference
        timestamp: new Date().toISOString()
      };
    } catch (extractError) {
      errorInfo = {
        extractionFailed: true,
        originalError: 'Failed to extract error details',
        timestamp: new Date().toISOString()
      };
    }
    
    console.error('API Error Interceptor:', errorInfo);
    
    // Log specific error details for debugging
    try {
      if (error.response?.status === 409) {
        console.warn('Conflict Error (409) - Request:', errorInfo.method, errorInfo.url);
        console.warn('Response Data:', error.response?.data);
      } else if (error.response?.status === 401) {
        console.warn('Authentication Error (401):', errorInfo.url);
      } else if (error.response?.status === 404) {
        console.warn('Not Found Error (404):', errorInfo.url);
      }
    } catch (logError) {
      console.error('Error in specific error logging:', logError);
    }
    
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
