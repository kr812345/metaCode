import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Add auth token to headers if available
        const token = localStorage.getItem('token') || 
                      document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            console.error('Network error occurred:', error);
            return Promise.reject(new Error('Network error occurred. Please check your connection.'));
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;