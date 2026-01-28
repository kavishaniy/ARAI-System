import { SCORE_THRESHOLDS, SCORE_COLORS, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './constants';

// Get score rating based on score value
export const getScoreRating = (score) => {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'EXCELLENT';
  if (score >= SCORE_THRESHOLDS.GOOD) return 'GOOD';
  return 'POOR';
};

// Get score color classes
export const getScoreColors = (score) => {
  const rating = getScoreRating(score);
  return SCORE_COLORS[rating];
};

// Format date to readable string
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format file size to readable string
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Validate file type
export const isValidFileType = (file) => {
  return ALLOWED_FILE_TYPES.includes(file.type);
};

// Validate file size
export const isValidFileSize = (file) => {
  return file.size <= MAX_FILE_SIZE;
};

// Validate file
export const validateFile = (file) => {
  const errors = [];
  
  if (!isValidFileType(file)) {
    errors.push('Invalid file type. Only PNG, JPG, and JPEG files are allowed.');
  }
  
  if (!isValidFileSize(file)) {
    errors.push(`File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit.`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

export default {
  getScoreRating,
  getScoreColors,
  formatDate,
  formatFileSize,
  isValidFileType,
  isValidFileSize,
  validateFile,
  truncateText,
  generateId,
  debounce,
  deepClone,
  isEmpty
};
