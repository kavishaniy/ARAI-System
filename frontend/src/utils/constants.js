// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://arai-system.onrender.com/api/v1';

// File Upload Configuration
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
export const ALLOWED_FILE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

// Score Thresholds
export const SCORE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  POOR: 0
};

// Score Colors
export const SCORE_COLORS = {
  EXCELLENT: {
    text: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200'
  },
  GOOD: {
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200'
  },
  POOR: {
    text: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200'
  }
};

// Analysis Status
export const ANALYSIS_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme'
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  ANALYSIS: '/analysis/:id',
  PROFILE: '/profile'
};

export default {
  API_BASE_URL,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  ALLOWED_FILE_EXTENSIONS,
  SCORE_THRESHOLDS,
  SCORE_COLORS,
  ANALYSIS_STATUS,
  STORAGE_KEYS,
  ROUTES
};
