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
        let isMounted = true;
    
        const connectSocket = async () => {
            if (!user?.token) {
                socketManager.disconnect();
                setIsConnected(false);
                setConnectionError(null);
                setReconnectAttempts(0);
                return;
            }
    
            try {
                const socket = await socketManager.connect(user.token);
                if (!isMounted) return;
    
                if (socket) {
                    setIsConnected(true);
                    setConnectionError(null);
                    toast.success('Connected to server');
                } else {
                    throw new Error('Failed to initialize socket');
                }
            } catch (err) {
                console.error('❌ Socket failed to connect:', err);
                setConnectionError(err.message);
                toast.error(`Failed to connect: ${err.message}`);
            }
    
            const cleanupConnect = socketManager.on('connect', () => {
                if (!isMounted) return;
                setIsConnected(true);
                setConnectionError(null);
                setReconnectAttempts(0);
            });
    
            const cleanupDisconnect = socketManager.on('disconnect', (reason) => {
                if (!isMounted) return;
                setIsConnected(false);
                setConnectionError(reason);
                toast.error(`Disconnected: ${reason}`);
            });

            const cleanupError = socketManager.on('connect_error', (error) => {
                if (!isMounted) return;
                setConnectionError(error.message);
                setReconnectAttempts(prev => prev + 1);
                toast.error(`Connection error: ${error.message}`);
            });
    
            return () => {
                cleanupConnect?.();
                cleanupDisconnect?.();
                cleanupError?.();
                socketManager.disconnect();
                isMounted = false;
            };
        };
    
        connectSocket();
    
        return () => {
            isMounted = false;
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