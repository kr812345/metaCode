'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { useRoom } from '@/contexts/RoomContext';
import toast from 'react-hot-toast';

const SpaceCard = ({ room }) => {
    const router = useRouter();
    const { handleJoinRoom, currentRoom } = useRoom();

    const handleRoomJoin = async () => {
        try {
            // If already in this room, just navigate
            if (currentRoom?.id === room.id) {
                router.push(`/room/${room.id}`);
                return;
            }

            const joinedRoom = await handleJoinRoom(room.id);
            if (joinedRoom) {
                router.push(`/room/${room.id}`);
            }
        } catch (error) {
            console.error('Join room error:', error);
            toast.error(error.message || 'Failed to join room');
        }
    };

    return (
        <div className="bg-[#ffffff62] bg-opacity-60 border-3 border-[#0DF2FF] rounded-xl p-4">
            <h3 className="text-xl font-semibold text-white mb-2">{room.name}</h3>
            <p className="text-gray-300 mb-4">{room.description}</p>
            <button
                onClick={handleRoomJoin}
                className="w-full bg-[#FF007A] text-white px-4 py-2 rounded-lg hover:bg-[#ff7aba] transition"
            >
                {currentRoom?.id === room.id ? 'Enter Room' : 'Join Room'}
            </button>
        </div>
    );
};

export default SpaceCard;