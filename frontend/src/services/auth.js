import api from './api';

export const authService = {
  async signup(email, password, fullName) {
    const response = await api.post('/auth/signup', {
      email,
      password,
      full_name: fullName,
    });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Store token timestamp for expiry tracking
      localStorage.setItem('token_timestamp', Date.now().toString());
    }
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Store token timestamp for expiry tracking
      localStorage.setItem('token_timestamp', Date.now().toString());
    }
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_timestamp');
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  // Check if token is expired or about to expire (within 5 minutes)
  isTokenExpired() {
    const timestamp = localStorage.getItem('token_timestamp');
    if (!timestamp) return true;
    
    const tokenAge = Date.now() - parseInt(timestamp);
    const ONE_HOUR = 60 * 60 * 1000; // Supabase tokens typically expire in 1 hour
    const FIVE_MINUTES = 5 * 60 * 1000;
    
    // Return true if token is older than 55 minutes (5 min buffer)
    return tokenAge > (ONE_HOUR - FIVE_MINUTES);
  },

  // Clear expired session
  clearSession() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_timestamp');
  }
};