'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useRoom } from '@/contexts/RoomContext';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Import components with dynamic imports to avoid window is not defined error
const AvatarManager = dynamic(() => import('../../../components/AvatarManager'), { ssr: false });
const ChatPanel = dynamic(() => import('../../../components/ChatPanel'), { ssr: false });
const BottomBar = dynamic(() => import('../../../components/bottomBar'), { ssr: false });

const RoomPage = () => {
    const params = useParams();
    const router = useRouter();
    const { roomId } = params;
    const { user } = useAuth();
    const { currentRoom, joinRoom: joinRoomContext, handleLeaveRoom } = useRoom();

    const {
        socket,
        isConnected,
        joinRoom,
        moveAvatar,
        sendMessage,
        addListener
    } = useSocket();

    // State management
    const [roomMembers, setRoomMembers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activePanel, setActivePanel] = useState('avatar');
    const [avatarPosition, setAvatarPosition] = useState({ x: 200, y: 200 });
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
            
            // Listen for chat messages
            const messageListener = addListener('room:message', (message) => {
                console.log('Message received in room:', message);
                // Make sure message format is consistent
                const formattedMessage = {
                    userId: message.userId,
                    username: message.username || message.name,
                    message: message.message || message.content,
                    timestamp: message.timestamp || new Date().toISOString()
                };
                setMessages(prev => [...prev, formattedMessage]);
            });
            
            // Listen for avatar movements
            const movementListener = addListener('avatar:move', (data) => {
                if (data.userId !== user?.id) {
                    // Update other avatars' positions
                    setRoomMembers(prev => 
                        prev.map(member => 
                            member.userId === data.userId 
                                ? { 
                                    ...member, 
                                    avatar: { 
                                        ...member.avatar, 
                                        x: data.x, 
                                        y: data.y, 
                                        direction: data.direction 
                                    } 
                                }
                                : member
                        )
                    );
                }
            });
            
            // Clean up listeners
            return () => {
                memberListener();
                messageListener();
                movementListener();
            };
        }
    }, [isConnected, roomId, joinRoom, user?.id, addListener]);

    useEffect(() => {
        if (!user?.token) {
            router.push('/login');
            return;
        }
        
        // Join room when component mounts
        const joinRoomOnMount = () => {
            try {
                 (async () => {await joinRoomContext(roomId)})();
            } catch (error) {
                console.error('Error joining room:', error);
                toast.error('Failed to join room');
                router.push('/dashboard');
            }
        };
        
        joinRoomOnMount();
    }, [user, router, roomId, joinRoomContext]);

    const handleAvatarMove = (x, y, direction) => {
        setAvatarPosition({ x, y });
        moveAvatar(roomId, x, y, direction);
    };

    const handlLeaveRoom = async () => {
        try {
            await handleLeaveRoom(roomId);
            router.push('/dashboard');
        } catch (error) {
            console.error('Leave room error:', error);
            toast.error('Failed to leave room');
        }
    };

    const handleSendMessage = (message) => {
        if (!message.trim()) return;
        
        // Construct the message object
        const messageObj = {
            userId: user.id,
            username: user.username || user.name,
            message, 
            timestamp: new Date().toISOString()
        };
        
        // Send via socket
        sendMessage(roomId, message);
        
        // Optimistically add message to list
        setMessages(prev => [...prev, messageObj]);
    };

    if (!isClient) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0A0F1E]">
            <div className="flex h-screen flex-col">
                {/* Main Content Area */}
                <div className="flex-1 flex">
                    {/* 2D Environment */}
                    <div className="flex-1 flex flex-col">
                        {activePanel === 'avatar' ? (
                            <AvatarManager
                                position={avatarPosition}
                                onAvatarMove={handleAvatarMove}
                                members={roomMembers}
                                roomId={roomId}
                                user={user}
                            />
                        ) : (
                            <ChatPanel
                                messages={messages}
                                onSendMessage={handleSendMessage}
                                roomMembers={roomMembers}
                            />
                        )}
                    </div>
                </div>

                {/* Bottom Bar */}
                <BottomBar
                    toggleChat={() => setActivePanel(prev => prev === 'chat' ? 'avatar' : 'chat')}
                    onLeaveRoom={handlLeaveRoom}
                />
            </div>
        </div>
    );
};

export default RoomPage;