// import axios from 'axios';

// const instance = axios.create({
//     // Set your base URL here
//     // baseURL: '172.25.0.239:5014',
//     baseURL: 'http://localhost:5014'
// });

// export default instance;


import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  // You can add other default configurations here
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Debug: Log the base URL to verify it's loaded correctly
console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL);

// Optional: Add request/response interceptors
instance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;