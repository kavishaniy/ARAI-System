import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://arai-system.onrender.com/api/v1';

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
      config.headers.Authorization = `Bearer ${token}`;
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
      
      // Check if it's a token expiration issue
      if (errorDetail.includes('expired') || errorDetail.includes('invalid JWT')) {
        console.warn('🔐 Token expired - clearing session');
        
        // Clear expired session
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('token_timestamp');
        
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('/login')) {
          // Store the current path to redirect back after login
          localStorage.setItem('redirect_after_login', window.location.pathname);
          
          // Show user-friendly message
          alert('Your session has expired. Please login again.');
          
          // Redirect to login
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
