'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { getRooms, createRoom, joinRoom, leaveRoom } from '../axiosReq/room';
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
    const [currentRoom, setRoom] = useState(null);
    const [roomMembers, setRoomMembers] = useState([]);

    const fetchRooms = async () => {
        const token = cookies.token;
        
        if (!token) {
            toast.error('Please log in to view rooms');
            router.push('/login');
            return;
        }
        
        try {
            setIsLoading(true);
            const response = await getRooms();
            
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
        if (!user?.token) {
            toast.error('Please log in to create a room');
            router.push('/login');
            return;
        }
        
        try {
            setIsLoading(true);
            const response = await createRoom(formData);
            
            if (response.success) {
                toast.success('Room created successfully!');
                setRooms(prevRooms => [...prevRooms, response.room]);
                return response.room;
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
        if (!user?.token) {
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
                setRoom(response.room);
                
                try {
                    console.log('Attempting to join room via socket...');
                    await socket.emit("join-room", { roomId });
                    console.log('Socket join successful');
                    toast.success('Joined room successfully');
                    setRoomMembers(response.room.members);
                    return response.room;
                } catch (socketError) {
                    console.error('Socket join error:', socketError);
                    // Even if socket join fails, we're still in the room via HTTP
                    toast.error('Connected to room but socket connection failed. Some features may not work.');
                    return response.room;
                }
            } else if (response.message === "Already a member of this room") {
                // If we're already a member, just set the current room and join via socket
                const room = await getRooms();
                const targetRoom = room.rooms.find(r => r.id === roomId);
                if (targetRoom) {
                    setRoom(targetRoom);
                    try {
                        await socket.emit("join-room", { roomId });
                        toast.success('Reconnected to room successfully');
                        setRoomMembers(targetRoom.members);
                        return targetRoom;
                    } catch (socketError) {
                        console.error('Socket join error:', socketError);
                        toast.error('Connected to room but socket connection failed. Some features may not work.');
                        return targetRoom;
                    }
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

    const handleLeaveRoom = async () => {
        if (!currentRoom) return;

        setIsLoading(true);
        setError(null);

        try {
            await leaveRoom(currentRoom.id);
            socket.emit("leave-room", { roomId: currentRoom.id });
            setRoom(null);
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

    useEffect(() => {
        if (!isConnected || !socket) return;

        const handleRoomJoined = (data) => {
            setRoom(data.room);
            setRoomMembers(data.members);
            setIsLoading(false);
        };

        const handleMemberJoined = (data) => {
            setRoomMembers(prev => [...prev, data.member]);
        };

        const handleMemberLeft = (data) => {
            setRoomMembers(prev => prev.filter(member => member.userId !== data.userId));
        };

        socket.on("room-joined", handleRoomJoined);
        socket.on("member-joined", handleMemberJoined);
        socket.on("member-left", handleMemberLeft);

        return () => {
            socket.off("room-joined", handleRoomJoined);
            socket.off("member-joined", handleMemberJoined);
            socket.off("member-left", handleMemberLeft);
        };
    }, [isConnected, socket]);

    const value = {
        rooms,
        currentRoom,
        roomMembers,
        isLoading,
        error,
        fetchRooms,
        createRoom: handleCreateRoom,
        handleJoinRoom,
        handleLeaveRoom
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