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
            return currentRoom;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await joinRoom(roomId);
            
            if (response.success) {
                setCurrentRoom(response.room);
                
                if (!socket.rooms || !socket.rooms[roomId]) {
                    try {
                        await socket.emit('join-room', roomId);
                        toast.success('Joined room successfully');
                    } catch (socketError) {
                        toast.error('Connected to room but socket connection failed. Some features may not work.');
                        console.error('Socket join error:', socketError);
                    }
                }
                setCurrentRoom(roomId);
                setRoomMembers(response.room.members);
                return response.room;
            } else {
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
        setIsLoading(true);
        setError(null);

        try {
            // First make HTTP request to leave room
            const response = await leaveRoom(roomId);
            
            if (response.success) {
                // Then emit socket event to leave room
                try {
                    if (socket && isConnected) {
                        await new Promise((resolve, reject) => {
                            const timeout = setTimeout(() => {
                                reject(new Error('Socket leave timeout'));
                            }, 5000); // 5 second timeout

                            socket.emit('leave-room', roomId, (error) => {
                                clearTimeout(timeout);
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve();
                                }
                            });
                        });
                    }
                } catch (socketError) {
                    console.error('Socket leave error:', socketError);
                    // Don't throw here, we still want to update local state
                }

                // Update local state
                setCurrentRoom(null);
                setRoomMembers([]);
                toast.success('Left room successfully');
                return true;
            } else {
                throw new Error(response.message || 'Failed to leave room');
            }
        } catch (err) {
            console.error('Leave room error:', err);
            const errorMessage = err.message || 'Failed to leave room';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getInviteLink = async (roomId) => {
        if (!cookies.token) {
            toast.error('Please log in to get invite link');
            router.push('/login');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${roomId}/invite`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${cookies.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to get invite link');
            }

            return data;
        } catch (error) {
            console.error('Get invite link error:', error);
            toast.error(error.message || 'Failed to get invite link');
            throw error;
        }
    };

    const handleJoinByInvite = async (inviteCode) => {
        if (!cookies.token) {
            toast.error('Please log in to join the room');
            router.push('/login');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/join/${inviteCode}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${cookies.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to join room');
            }

            // Update current room and members
            setCurrentRoom(data.room);
            setRoomMembers(data.room.members);
            return data.room;
        } catch (error) {
            console.error('Join room by invite error:', error);
            toast.error(error.message || 'Failed to join room');
            throw error;
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
        getInviteLink,
        handleJoinByInvite
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