'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useRoom } from '../contexts/RoomContext';
import { useVideoCall } from '../contexts/VideoCallContext';
import { useSocket } from '../contexts/SocketContext';

const Logout = () => {
    const router = useRouter();
    const { logout } = useAuth();
    const { setCurrentRoom } = useRoom();
    const { endCall } = useVideoCall();
    const { socket } = useSocket();

    useEffect(() => {
        const performLogout = async () => {
            try {
                // End any active video calls
                endCall();
                
                // Leave current room
                setCurrentRoom(null);
                
                // Disconnect socket
                if (socket) {
                    socket.disconnect();
                }
                
                // Perform auth logout
                await logout();
                
                // Show success message
                toast.success('Logged out successfully!');
                
                // Redirect to login page
                router.push('/login');
            } catch (error) {
                console.error('Logout error:', error);
                toast.error('Error during logout');
                // Still try to redirect even if there's an error
                router.push('/login');
            }
        };

        performLogout();
    }, [router, logout, setCurrentRoom, endCall, socket]);

    return null;
}

export default Logout;
