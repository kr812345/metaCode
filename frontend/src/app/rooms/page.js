'use client'
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getRooms } from '../../axiosReq/room';
import SpaceCard from '../../components/SpaceCard';
import CreateRoom from '../../components/CreateRoom';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const RoomsPage = () => {
    const router = useRouter();
    const { token } = useSelector((state) => state.auth);
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateRoom, setShowCreateRoom] = useState(false);

    const fetchRooms = async () => {
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            console.log('fetching rooms.....');
            setIsLoading(true);
            const response = await getRooms(token);        
            console.log(response); 
            if (response.success) {
                setRooms(response.rooms);
            } else {
                toast.error(response.message || 'Failed to fetch rooms');
            }
        } catch (error) {
            console.error('Fetch rooms error:', error);
            toast.error('An error occurred while fetching rooms');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [token, router]);

    return (
        <div className="min-h-screen bg-[#0A0F1E] text-white p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[#0DF2FF]">Available Rooms</h1>
                <button 
                    onClick={() => setShowCreateRoom(!showCreateRoom)}
                    className="bg-[#FF007A] px-4 py-2 rounded-md hover:bg-[#faafd3] hover:text-pink-600 transition duration-300"
                >
                    {showCreateRoom ? 'Cancel' : 'Create Room'}
                </button>
            </div>

            {showCreateRoom && <CreateRoom onClose={() => setShowCreateRoom(false)} />}

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0DF2FF]"></div>
                </div>
            ) : rooms.length === 0 ? (
                <div className="text-center text-gray-400">
                    No rooms available. Create a new room to get started!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <SpaceCard key={room._id} room={room} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoomsPage;