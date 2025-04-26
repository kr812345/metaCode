'use client'

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRoom } from '@/contexts/RoomContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const JoinRoomPage = () => {
    const params = useParams();
    const router = useRouter();
    const { inviteCode } = params;
    const { handleJoinByInvite } = useRoom();
    const { user } = useAuth();

    useEffect(() => {
        const joinRoom = async () => {
            if (!user) {
                toast.error('Please log in to join the room');
                router.push('/login');
                return;
            }

            try {
                const room = await handleJoinByInvite(inviteCode);
                if (room) {
                    router.push(`/room/${room.id}`);
                }
            } catch (error) {
                console.error('Error joining room:', error);
                toast.error(error.message || 'Failed to join room');
                router.push('/dashboard');
            }
        };

        joinRoom();
    }, [inviteCode, handleJoinByInvite, router, user]);

    return (
        <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
            <div className="text-white text-center">
                <h1 className="text-2xl mb-4">Joining room...</h1>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0DF2FF] mx-auto"></div>
            </div>
        </div>
    );
};

export default JoinRoomPage; 