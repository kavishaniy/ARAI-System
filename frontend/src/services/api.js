import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Ensure token doesn't already have "Bearer " prefix
      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = bearerToken;
      console.log('🔐 Auth token added to request');
    } else {
      console.warn('⚠️ No access token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    // If response is successful, return it as is
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (expired or invalid token)
    if (error.response?.status === 401) {
      const errorDetail = error.response?.data?.detail || '';
      
      console.error('401 Unauthorized Error:', {
        detail: errorDetail,
        status: error.response?.status,
        message: error.message,
        token: localStorage.getItem('access_token') ? 'Token exists in localStorage' : 'No token in localStorage',
        fullResponse: error.response?.data
      });
      
      // Check if it's a token expiration or invalid token issue
      if (errorDetail.includes('expired') || 
          errorDetail.includes('invalid') || 
          errorDetail.includes('Invalid') ||
          errorDetail.includes('token')) {
        
        console.warn('🔐 Token issue detected - clearing session');
        
        // Clear expired/invalid session
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('token_timestamp');
        
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('/login')) {
          // Store the current path to redirect back after login
          localStorage.setItem('redirect_after_login', window.location.pathname);
          
          // Show user-friendly message
          alert('⚠️ Your session is invalid or has expired. Please login again.');
          
          // Redirect to login
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
