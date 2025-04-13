'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import socketManager from '../utils/socketManager';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    useEffect(() => {
        if (!user?.token) return;

        const handleConnect = () => {
            setIsConnected(true);
            setConnectionError(null);
            setReconnectAttempts(0);
            toast.success('Connected to server');
        };

        const handleDisconnect = (reason) => {
            setIsConnected(false);
            setConnectionError(reason);
            toast.error(`Disconnected: ${reason}`);
        };

        const handleConnectError = (error) => {
            setIsConnected(false);
            setConnectionError(error);
            toast.error('Connection failed');
        };

        const handleReconnect = (attemptNumber) => {
            setIsConnected(true);
            setConnectionError(null);
            setReconnectAttempts(0);
            toast.success(`Reconnected after ${attemptNumber} attempts`);
        };

        const handleReconnectAttempt = (attemptNumber) => {
            setReconnectAttempts(attemptNumber);
            toast.info(`Attempting to reconnect (${attemptNumber}/5)`);
        };

        const handleReconnectError = (error) => {
            toast.error(`Reconnection failed: ${error.message}`);
        };

        const handleReconnectFailed = () => {
            toast.error('Failed to reconnect after multiple attempts');
        };

        const handleError = (error) => {
            toast.error(error);
        };

        // Connect to socket
        socketManager.connect(user.token);

        // Add event listeners
        const cleanupConnect = socketManager.on('connect', handleConnect);
        const cleanupDisconnect = socketManager.on('disconnect', handleDisconnect);
        const cleanupError = socketManager.on('connect_error', handleConnectError);
        const cleanupReconnect = socketManager.on('reconnect', handleReconnect);
        const cleanupReconnectAttempt = socketManager.on('reconnect_attempt', handleReconnectAttempt);
        const cleanupReconnectError = socketManager.on('reconnect_error', handleReconnectError);
        const cleanupReconnectFailed = socketManager.on('reconnect_failed', handleReconnectFailed);
        const cleanupErrorEvent = socketManager.on('error', handleError);

        // Initial connection status
        setIsConnected(socketManager.getConnectionStatus());
        setReconnectAttempts(socketManager.getReconnectAttempts());

        return () => {
            cleanupConnect();
            cleanupDisconnect();
            cleanupError();
            cleanupReconnect();
            cleanupReconnectAttempt();
            cleanupReconnectError();
            cleanupReconnectFailed();
            cleanupErrorEvent();
            socketManager.disconnect();
        };
    }, [user?.token]);

    const joinRoom = useCallback((roomId) => {
        const success = socketManager.joinRoom(roomId);
        if (!success) {
            toast.error('Failed to join room. Please check your connection.');
        }
    }, []);

    const leaveRoom = useCallback((roomId) => {
        const success = socketManager.leaveRoom(roomId);
        if (!success) {
            toast.error('Failed to leave room. Please check your connection.');
        }
    }, []);

    const moveAvatar = useCallback((roomId, x, y, direction) => {
        const success = socketManager.moveAvatar(roomId, x, y, direction);
        if (!success) {
            toast.error('Failed to move avatar. Please check your connection.');
        }
    }, []);

    const updateCode = useCallback((roomId, code, language) => {
        const success = socketManager.updateCode(roomId, code, language);
        if (!success) {
            toast.error('Failed to update code. Please check your connection.');
        }
    }, []);

    const sendMessage = useCallback((roomId, message) => {
        const success = socketManager.sendMessage(roomId, message);
        if (!success) {
            toast.error('Failed to send message. Please check your connection.');
        }
    }, []);

    const initiateCall = useCallback((roomId, targetUserId, offer) => {
        const success = socketManager.initiateCall(roomId, targetUserId, offer);
        if (!success) {
            toast.error('Failed to initiate call. Please check your connection.');
        }
    }, []);

    const answerCall = useCallback((roomId, targetUserId, answer) => {
        const success = socketManager.answerCall(roomId, targetUserId, answer);
        if (!success) {
            toast.error('Failed to answer call. Please check your connection.');
        }
    }, []);

    const sendIceCandidate = useCallback((roomId, targetUserId, candidate) => {
        const success = socketManager.sendIceCandidate(roomId, targetUserId, candidate);
        if (!success) {
            toast.error('Failed to send ICE candidate. Please check your connection.');
        }
    }, []);

    const addListener = useCallback((event, callback) => {
        return socketManager.on(event, callback);
    }, []);

    return (
        <SocketContext.Provider value={{
            socket: socketManager.getSocket(),
            isConnected,
            connectionError,
            reconnectAttempts,
            currentRoom: socketManager.getCurrentRoom(),
            joinRoom,
            leaveRoom,
            moveAvatar,
            updateCode,
            sendMessage,
            initiateCall,
            answerCall,
            sendIceCandidate,
            addListener
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}; 