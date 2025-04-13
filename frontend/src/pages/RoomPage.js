import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '../contexts/RoomContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import RoomManager from '../components/RoomManager';

const RoomPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentRoom, handleJoinRoom, handleLeaveRoom, isLoading, error } = useRoom();

    useEffect(() => {
        if (!user) {
            toast.error('Please log in to join a room');
            navigate('/login');
            return;
        }

        if (!currentRoom) {
            handleJoinRoom(roomId).catch(() => {
                navigate('/');
            });
        }

        return () => {
            if (currentRoom) {
                handleLeaveRoom();
            }
        };
    }, [roomId, user, currentRoom]);

    if (isLoading) {
        return <div>Loading room...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!currentRoom) {
        return null;
    }

    return (
        <div className="room-page">
            <RoomManager room={currentRoom} />
        </div>
    );
};

export default RoomPage; 