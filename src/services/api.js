import axios from 'axios';

/**
 * Pre-configured Axios instance for ShopKart
 * Crucial configuration: withCredentials: true ensures that
 * HttpOnly session cookies set by the backend (/customers/login)
 * are stored in the browser and automatically sent on subsequent
 * requests (e.g. /customers/me, /customers/logout).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL : '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

/**
 * Utility helper to extract readable error message from API response
 */
export const getErrorMessage = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code outside 2xx
    return (
      error.response.data?.message ||
      error.response.data?.error ||
      (error.response.status === 401 ? 'Invalid Credentials' : null) ||
      `Server error: ${error.response.statusText || error.response.status}`
    );
  } else if (error.request) {
    // The request was made but no response was received
    return 'Unable to reach the server. Please check your backend connection.';
  } else {
    // Error setting up the request
    return error.message || 'An unexpected error occurred';
  }
};

export default api;
