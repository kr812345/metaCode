import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

const RoomManager = ({ roomId }) => {
    const {
        isConnected,
        connectionError,
        joinRoom,
        moveAvatar,
        updateCode,
        sendMessage,
        addListener
    } = useSocket();

    const [roomMembers, setRoomMembers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [currentCode, setCurrentCode] = useState('');

    useEffect(() => {
        if (roomId) {
            joinRoom(roomId);
        }

        // Listen for room events
        const userEnteredListener = addListener('user-entered', (userData) => {
            setRoomMembers(prev => [...prev, userData]);
        });

        const userLeftListener = addListener('user-left', (userData) => {
            setRoomMembers(prev => 
                prev.filter(member => member.userId !== userData.userId)
            );
        });

        const messageListener = addListener('message-received', (messageData) => {
            setMessages(prev => [...prev, messageData]);
        });

        const codeUpdateListener = addListener('code-updated', (codeData) => {
            setCurrentCode(codeData.code);
        });

        // Cleanup listeners
        return () => {
            userEnteredListener();
            userLeftListener();
            messageListener();
            codeUpdateListener();
        };
    }, [roomId]);

    const handleAvatarMove = (x, y, direction) => {
        moveAvatar(roomId, x, y, direction);
    };

    const handleCodeUpdate = (newCode) => {
        updateCode(roomId, newCode, 'javascript');
        setCurrentCode(newCode);
    };

    const handleSendMessage = (message) => {
        sendMessage(roomId, message);
    };

    if (connectionError) {
        return <div>Connection Error: {connectionError.message}</div>;
    }

    return (
        <div>
            <h2>Room: {roomId}</h2>
            {!isConnected && <div>Connecting...</div>}

            <div>
                <h3>Room Members</h3>
                {roomMembers.map(member => (
                    <div key={member.userId}>
                        {member.name} - {member.avatar.name}
                    </div>
                ))}
            </div>

            <div>
                <h3>Code Editor</h3>
                <textarea
                    value={currentCode}
                    onChange={(e) => handleCodeUpdate(e.target.value)}
                    placeholder="Start coding together..."
                />
            </div>

            <div>
                <h3>Chat</h3>
                {messages.map((msg, index) => (
                    <div key={index}>
                        {msg.name}: {msg.message}
                    </div>
                ))}
                <input
                    type="text"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleSendMessage(e.target.value);
                            e.target.value = '';
                        }
                    }}
                    placeholder="Type a message..."
                />
            </div>
        </div>
    );
};

export default RoomManager; 