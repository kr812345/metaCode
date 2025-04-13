import axios from 'axios';
import useToken from '@/hooks/useToken';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getToken = () => {
    const token = localStorage.getItem('token');
    return token;
};

// Helper function to create axios instance with auth header
const createAxiosInstance = () => {
    const token = getToken();
    if (!token) {
        throw new Error('No authentication token found');
    }
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
};

export const createRoom = async (roomData) => {
    try {
        const axiosInstance = createAxiosInstance();
        const response = await axiosInstance.post('/api/rooms/createRoom', roomData);
        return response.data;
    } catch (error) {
        console.error('Create room error:', error);
        throw error.response?.data || error;
    }
};

export const getRooms = async () => {
    try {
        const axiosInstance = createAxiosInstance();
        const response = await axiosInstance.get('/api/rooms/getRooms');
        return response.data;
    } catch (error) {
        console.error('Get rooms error:', error);
        throw error.response?.data || error;
    }
};

export const joinRoom = async (roomId) => {
    try {
        const axiosInstance = createAxiosInstance();
        const response = await axiosInstance.post(`/api/rooms/joinRoom/${roomId}`);
        return response.data;
    } catch (error) {
        console.error('Join room error:', error);
        throw error.response?.data || error;
    }
};

export const leaveRoom = async (roomId) => {
    try {
        const axiosInstance = createAxiosInstance();
        const response = await axiosInstance.post(`/api/rooms/leaveRoom/${roomId}`);
        return response.data;
    } catch (error) {
        console.error('Leave room error:', error);
        throw error.response?.data || error;
    }
};