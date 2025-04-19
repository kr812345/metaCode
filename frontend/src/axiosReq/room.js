import axiosInstance from './config';

export const createRoom = async (roomData) => {
    try {
        const response = await axiosInstance.post('/rooms', roomData);
        return response.data;
    } catch (error) {
        console.error('Create room error:', error);
        throw error.response?.data || error;
    }
};

export const getRooms = async (token) => {
    try {
        const config = {};
        if (token) {
            config.headers = { Authorization: `Bearer ${token}` };
        }
        const response = await axiosInstance.get('/rooms', config);
        return response.data;
    } catch (error) {
        console.error('Get rooms error:', error);
        throw error.response?.data || error;
    }
};

export const joinRoom = async (roomId) => {
    try {
        const response = await axiosInstance.post(`/rooms/${roomId}/join`);
        return response.data;
    } catch (error) {
        console.error('Join room error:', error);
        throw error.response?.data || error;
    }
};

export const leaveRoom = async (roomId) => {
    try {
        const response = await axiosInstance.post(`/rooms/${roomId}/leave`);
        return response.data;
    } catch (error) {
        console.error('Leave room error:', error);
        throw error.response?.data || error;
    }
};

export const joinRoomByInvite = async (inviteCode) => {
    try {
        const response = await axiosInstance.post(`/rooms/join/invite/${inviteCode}`);
        return response.data;
    } catch (error) {
        console.error('Join room by invite error:', error);
        throw error.response?.data || error;
    }
};

export const getInviteLink = (inviteCode) => {
    return `${window.location.origin}/invite/${inviteCode}`;
};