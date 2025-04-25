'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { getRooms, createRoom, joinRoom, leaveRoom, joinRoomByInvite, getInviteLink } from '../axiosReq/room';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useCookies } from 'react-cookie';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { socket, isConnected } = useSocket();
    const { user } = useAuth();
    const [cookies] = useCookies(['token']);
    const router = useRouter();
    const [currentRoom, setCurrentRoom] = useState(null);
    const [roomMembers, setRoomMembers] = useState([]);

    const fetchRooms = async () => {
        if (!cookies.token) {
            toast.error('Please log in to view rooms');
            router.push('/login');
            return;
        }
        
        try {
            setIsLoading(true);
            const response = await getRooms(cookies.token);
            
            if (response.success) {
                setRooms(response.rooms);
            } else {
                toast.error(response.message || 'Failed to fetch rooms');
            }
        } catch (error) {
            console.error('Fetch rooms error:', error);
            toast.error(error.message || 'An error occurred while fetching rooms');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateRoom = async (formData) => {
        if (!cookies.token) {
            toast.error('Please log in to create a room');
            router.push('/login');
            return;
        }
        
        try {
            setIsLoading(true);
            const response = await createRoom(formData);
            
            if (response.success) {
                const roomData = {
                    ...response.room,
                    inviteCode: response.room.inviteCode
                };
                toast.success('Room created successfully!');
                setRooms(prevRooms => [...prevRooms, roomData]);
                setCurrentRoom(roomData);
                return roomData;
            } else {
                toast.error(response.message || 'Failed to create room');
                return null;
            }
        } catch (error) {
            console.error('Room creation error:', error);
            toast.error(error.message || 'An error occurred while creating the room');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinRoom = async (roomId) => {
        if (!cookies.token) {
            toast.error('Please log in to join a room');
            router.push('/login');
            return;
        }

        if (currentRoom?.id === roomId) {
            return currentRoom; // Already in this room
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('Attempting to join room via HTTP...');
            const response = await joinRoom(roomId);
            
            if (response.success) {
                console.log('HTTP join successful:', response.room);
                setCurrentRoom(response.room);
                
                try {
                    console.log('Attempting to join room via socket...');
                    await socket.emit('join-room', roomId);
                    console.log('Socket join successful');
                    toast.success('Joined room successfully');
                    setRoomMembers(response.room.members);
                    return response.room;
                } catch (socketError) {
                    toast.error('Connected to room but socket connection failed. Some features may not work.');
                    console.error('Socket join error:', socketError);
                    return response.room;
                }
            } else {
                console.error('Invalid response from server:', response);
                throw new Error(response.message || 'Invalid response from server');
            }
        } catch (err) {
            console.error('Join room error:', err);
            const errorMessage = err.message || 'Failed to join room';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeaveRoom = async (roomId) => {
        if (!currentRoom) return;

        setIsLoading(true);
        setError(null);

        try {
            await leaveRoom(roomId);
            socket.emit('leave-room', roomId);
            setCurrentRoom(null);
            setRoomMembers([]);
            toast.success('Left room successfully');
        } catch (err) {
            console.error('Leave room error:', err);
            const errorMessage = err.message || 'Failed to leave room';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinByInvite = async (inviteCode) => {
        if (!cookies.token) {
            toast.error('Please log in to join a room');
            router.push('/login');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await joinRoomByInvite(inviteCode);
            
            if (response.success) {
                setCurrentRoom(response.room);
                // Connect to socket room
                try {
                    await socket.emit('join-room', response.room.id);
                    toast.success('Joined room successfully');
                    setRoomMembers(response.room.members);
                    return response.room;
                } catch (socketError) {
                    console.error('Socket join error:', socketError);
                    toast.error('Connected to room but socket connection failed. Some features may not work.');
                    return response.room;
                }
            } else {
                throw new Error(response.message || 'Failed to join room');
            }
        } catch (err) {
            console.error('Join room by invite error:', err);
            const errorMessage = err.message || 'Failed to join room';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Socket event handlers for room updates
    useEffect(() => {
        if (!isConnected || !socket) return;

        const handleRoomJoined = (data) => {
            setCurrentRoom(data);
            setRoomMembers(data.members);
            setIsLoading(false);
        };

        const handleUserEntered = (data) => {
            setRoomMembers(prev => [...prev, {
                userId: data.userId,
                name: data.name,
                avatar: data.avatar,
                color: data.color
            }]);
            toast.success(`${data.name} joined the room`);
        };

        const handleUserLeft = (data) => {
            setRoomMembers(prev => prev.filter(member => member.userId !== data.userId));
            toast.info(`${data.name} left the room`);
        };

        const handleError = (error) => {
            setError(error);
            toast.error(error);
        };

        socket.on('room-joined', handleRoomJoined);
        socket.on('user-entered', handleUserEntered);
        socket.on('user-left', handleUserLeft);
        socket.on('room-error', handleError);

        return () => {
            socket.off('room-joined', handleRoomJoined);
            socket.off('user-entered', handleUserEntered);
            socket.off('user-left', handleUserLeft);
            socket.off('room-error', handleError);
        };
    }, [isConnected, socket]);

    // Reset room state when user logs out
    useEffect(() => {
        if (!cookies.token) {
            setCurrentRoom(null);
            setRoomMembers([]);
            setRooms([]);
        }
    }, [cookies.token]);

    const value = {
        rooms,
        setCurrentRoom,
        currentRoom,
        roomMembers,
        isLoading,
        error,
        fetchRooms,
        createRoom: handleCreateRoom,
        handleJoinRoom,
        handleLeaveRoom,
        handleJoinByInvite,
        getInviteLink
    };

    return (
        <RoomContext.Provider value={value}>
            {children}
        </RoomContext.Provider>
    );
};

export const useRoom = () => {
    const context = useContext(RoomContext);
    if (!context) {
        throw new Error('useRoom must be used within a RoomProvider');
    }
    return context;
};