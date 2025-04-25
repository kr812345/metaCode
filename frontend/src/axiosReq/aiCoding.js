import axiosInstance from './config';

export const getCurrentProblem = async () => {
    try {
        const response = await axiosInstance.get('/ai-coding/problem');
        return response.data;
    } catch (error) {
        console.error('Get problem error:', error);
        throw error.response?.data || error;
    }
};

export const submitSolution = async (code, language) => {
    try {
        const response = await axiosInstance.post('/ai-coding/submit', { code, language });
        return response.data;
    } catch (error) {
        console.error('Submit solution error:', error);
        throw error.response?.data || error;
    }
};

export const getUserProgress = async () => {
    try {
        const response = await axiosInstance.get('/ai-coding/progress');
        return response.data;
    } catch (error) {
        console.error('Get user progress error:', error);
        throw error.response?.data || error;
    }
};

export const skipProblem = async () => {
    try {
        const response = await axiosInstance.post('/ai-coding/skip');
        return response.data;
    } catch (error) {
        console.error('Skip problem error:', error);
        throw error.response?.data || error;
    }
};
