import axios from 'axios';
import { getToken } from '../utils/authToken';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  timeout: 10000 // 10 second timeout
});

// Add request interceptor for authorization and API prefixing
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    
    // Skip modification for FormData (file uploads)
    const isFormData = config.data instanceof FormData;
    
    // Only modify the URL if it's a relative URL (doesn't start with http)
    if (!config.url.startsWith('http')) {
      // Ensure the URL starts with a slash
      let url = config.url.startsWith('/') ? config.url : `/${config.url}`;
      
      // Special handling for auth endpoints
      if (url.startsWith('/auth/')) {
        // Remove any existing /api prefix for auth endpoints
        url = url.replace(/^\/api/, '');
      } else if (!url.startsWith('/api/')) {
        // Add /api prefix for non-auth API endpoints
        url = `/api${url}`;
      }
      
      config.url = url;
    }
    
    // Get the token from localStorage
    const token = getToken();
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For FormData, let the browser set the Content-Type with the correct boundary
    if (isFormData && config.headers['Content-Type'] === 'multipart/form-data') {
      delete config.headers['Content-Type'];
      delete config.headers['Accept'];
    }
    
    // Log the request for debugging
    console.log('Request config:', {
      url: config.baseURL + config.url,
      method: config.method,
      headers: { ...config.headers },
      data: isFormData ? '[FormData]' : config.data
    });
    
    return config;
  },
  (error) => {
    console.error('Request error in interceptor:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('login')) {
          window.location.href = '/admin/login';
        }
      }
      
      // Return the error response data if available
      return Promise.reject(error.response.data || 'An error occurred');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return Promise.reject('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      return Promise.reject(error.message);
    }
  }
);

export default axiosInstance;
