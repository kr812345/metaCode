'use client'
import React, { useState, useRef, useEffect } from 'react';

const ChatPanel = ({ messages, onSendMessage, roomMembers = [] }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    const formatTimestamp = (timestamp) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (error) {
            console.error('Error formatting timestamp:', error);
            return '';
        }
    };

    const getUserColor = (userId) => {
        const member = roomMembers.find(m => m.userId === userId);
        return member?.avatar?.color || '#3498db';
    };

    // For debugging
    console.log('Messages in ChatPanel:', messages);
    console.log('Room members in ChatPanel:', roomMembers);

    return (
        <div className="h-full flex flex-col bg-[#0A2342] rounded-lg p-4">
            <h3 className="text-xl font-bold text-[#0DF2FF] mb-4">Chat</h3>
            
            {/* Member list */}
            <div className="mb-4">
                <h4 className="text-sm font-medium text-[#0DF2FF] mb-2">Members in Room ({roomMembers.length})</h4>
                <div className="flex flex-wrap gap-2">
                    {roomMembers.map(member => (
                        <div 
                            key={member.userId}
                            className="flex items-center space-x-1 bg-[#172033] rounded-full px-2 py-1"
                        >
                            <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                                style={{ backgroundColor: member.avatar?.color || '#3498db' }}
                            >
                                {member.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-white text-xs">{member.name || 'Unknown'}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 bg-[#0A0F1E] rounded-lg p-3">
                {messages.length === 0 ? (
                    <div className="text-gray-400 text-center mt-4">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const messageContent = msg.message || msg.content || '';
                        const username = msg.username || msg.name || 'Unknown';
                        
                        return (
                            <div key={index} className="mb-3">
                                <div className="flex items-center mb-1">
                                    <div 
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs mr-2"
                                        style={{ backgroundColor: getUserColor(msg.userId) }}
                                    >
                                        {username[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="font-medium text-[#0DF2FF]">{username}</span>
                                    <span className="text-gray-400 text-xs ml-2">
                                        {formatTimestamp(msg.timestamp)}
                                    </span>
                                </div>
                                <div className="pl-8 text-white">{messageContent}</div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>
            
            {/* Message input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#172033] text-white border border-[#0DF2FF] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0DF2FF]"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-[#0DF2FF] text-black px-4 py-2 rounded-lg hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatPanel; 