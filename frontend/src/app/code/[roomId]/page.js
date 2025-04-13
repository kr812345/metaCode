'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useRoom } from '@/contexts/RoomContext';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Import components with dynamic imports to avoid window is not defined error
const CodeEditor = dynamic(() => import('../../../components/CodeEditor'), { ssr: false });
const BottomBar = dynamic(() => import('../../../components/bottomBar'), { ssr: false });

const CodeEditorPage = () => {
    const params = useParams();
    const router = useRouter();
    const { roomId } = params;
    const { user } = useAuth();
    const { currentRoom } = useRoom();

    const {
        socket,
        isConnected,
        joinRoom,
        updateCode,
        addListener
    } = useSocket();

    // State management
    const [roomMembers, setRoomMembers] = useState([]);
    const [currentCode, setCurrentCode] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isConnected && roomId) {
            joinRoom(roomId);
            
            // Listen for room member updates
            const memberListener = addListener('room:members', (members) => {
                setRoomMembers(members);
            });
            
            // Listen for code updates
            const codeListener = addListener('code:update', (data) => {
                if (data.roomId === roomId) {
                    setCurrentCode(data.code);
                }
            });
            
            // Clean up listeners
            return () => {
                memberListener();
                codeListener();
            };
        }
    }, [isConnected, roomId, joinRoom, addListener]);

    useEffect(() => {
        if (!user?.token) {
            router.push('/login');
        }
    }, [user, router]);

    const handleCodeChange = (code) => {
        setCurrentCode(code);
        if (isConnected) {
            updateCode(roomId, code);
        }
    };

    const handleLeaveEditor = () => {
        router.push(`/room/${roomId}`);
    };

    if (!isClient) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0A0F1E]">
            <div className="flex h-screen flex-col">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    {/* Code Editor */}
                    <div className="flex-1">
                        <CodeEditor
                            code={currentCode}
                            onCodeChange={handleCodeChange}
                            roomMembers={roomMembers}
                        />
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-2">
                        <BottomBar
                            onLeaveRoom={handleLeaveEditor}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeEditorPage; 