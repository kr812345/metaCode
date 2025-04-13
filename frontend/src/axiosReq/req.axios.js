import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Add auth token to headers if available
        const token = localStorage.getItem('token');
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
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            cookies.remove('token', { path: '/' });
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const getRequest = async (url, config = {}) => {
    try {
        const response = await axiosInstance.get(url, config);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const postRequest = async (url, data, config = {}) => {
    try {
        const response = await axiosInstance.post(url, data, config);
        return response;
    } catch (error) {
        throw error;
    }
};

export const putRequest = async (url, data, config = {}) => {
    try {
        const response = await axiosInstance.put(url, data, config);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteRequest = async (url, config = {}) => {
    try {
        const response = await axiosInstance.delete(url, config);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default axiosInstance;
