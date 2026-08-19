import axios from 'axios';

const api = axios.create({
  baseURL: '', // Using relative URL since Vite proxy forwards to port 8080
});

// Request Interceptor: Attach JWT Token automatically
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('company_erp_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData && userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`;
        }
      } catch (e) {
        // Stored user data is corrupt
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally (e.g. 401 token expiration)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout on unauthorized response (token expired)
      localStorage.removeItem('company_erp_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
