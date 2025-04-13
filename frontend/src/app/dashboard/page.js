'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Particles from '@/components/Particles';
import Link from 'next/link';
import HomeIcon from '../../../public/home.svg'; 
import Image from 'next/image';
import SpaceCard from '@/components/SpaceCard';
import LogoutIcon from '../../../public/logout.svg';
import CreateRoom from '@/components/CreateRoom';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRoom } from '@/contexts/RoomContext';
import { useCookies } from 'react-cookie';

const Dashboard = () => {
    const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
    const router = useRouter();
    const { logout } = useAuth();
    const { rooms, fetchRooms, isLoading, setCurrentRoom, currentRoom, setRooms } = useRoom();
    const [cookies] = useCookies(['token']);

    useEffect(() => {
        // Check if user is authenticated
        if (cookies.token) {
            localStorage.setItem('token', cookies.token);
        }
        if (!cookies.token) {
            router.push('/login');
        } else {
            // Fetch rooms when component mounts
            fetchRooms();
        }
    }, [cookies.token, router]); // Don't include fetchRooms in dependency array

    useEffect(() => {
        // Clear current room when leaving dashboard
        return () => {
            () => {
                setCurrentRoom(null);
            }
        };
    }, [setCurrentRoom]);

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            // Clear current room and rooms state
            setCurrentRoom(null);
            setRooms([]);
            
            // Clear any active socket connections
            if (window.socket) {
                window.socket.disconnect();
            }
            
            // Call logout
            logout();
            
            // Show success message
            toast.success('Logged out successfully!');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Logout failed. Please try again.');
        }
    };

    const handleRefresh = async () => {
        try {
            setCurrentRoom(null); // Clear current room before refresh
            await fetchRooms();
            toast.success('Rooms refreshed successfully!');
        } catch (error) {
            console.error('Refresh error:', error);
            toast.error('Failed to refresh rooms');
        }
    };

    const memoizedParticles = useMemo(() => <Particles />, []);

    return (
        <div className="min-h-screen bg-[#0A0F1E]">
            {memoizedParticles}
            <div className="relative z-10">
                <header className="bg-[#ffffff62] bg-opacity-60 border-3 border-[#0DF2FF] p-4">
                    <div className="container mx-auto flex justify-between items-center">
                        <Link href="/" className="flex items-center">
                            <Image src={HomeIcon} alt="Home" width={24} height={24} />
                        </Link>
                        <button onClick={handleLogout} className="flex items-center">
                            <Image src={LogoutIcon} alt="Logout" width={24} height={24} />
                        </button>
                    </div>
                </header>

                <main className="container mx-auto p-4">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-white">Your Rooms</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={handleRefresh}
                                className="bg-[#0DF2FF] text-white px-4 py-2 rounded-lg hover:bg-[#0acce6] transition"
                            >
                                Refresh
                            </button>
                            <button
                                onClick={() => setIsCreateFormOpen(true)}
                                className="bg-[#FF007A] text-white px-4 py-2 rounded-lg hover:bg-[#ff7aba] transition"
                            >
                                Create Room
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-white text-center">Loading rooms...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rooms.map((room) => (
                                <SpaceCard key={room.id} room={room} />
                            ))}
                        </div>
                    )}
                </main>

                {isCreateFormOpen && (
                    <CreateRoom onClose={() => setIsCreateFormOpen(false)} />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
