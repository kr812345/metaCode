import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const ChatComponent = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socket = io('http://localhost:3000'); // Adjust the URL as needed

    useEffect(() => {
        // Fetch initial chat messages from the server
        const fetchMessages = async () => {
            try {
                const response = await axios.get('/api/chat/messages');
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();

        // Listen for new messages from the socket
        socket.on('newMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => {
            socket.off('newMessage'); // Clean up the listener on component unmount
        };
    }, [socket]);

    const handleSendMessage = async () => {
        if (newMessage.trim()) {
            try {
                const response = await axios.post('/api/chat/messages', { message: newMessage });
                socket.emit('sendMessage', response.data); // Emit the message to the socket
                setNewMessage('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    return (
        <div className="w-80 h-162 flex-shrink-0 rounded-lg border-2 border-[#0DF2FF] bg-[#023A3E] shadow-lg flex flex-col">
            <div className="p-4 text-white flex-grow">
                {messages.map((msg, index) => (
                    <div key={index}>{msg.user}: {msg.message}</div>
                ))}
            </div>
            <div className="flex">
                <input 
                    type='text' 
                    className="p-2 rounded-lg border-none m-2 w-[calc(100%-16px)] bg-[#1E1E1E] text-white" 
                    placeholder='Type a message...'
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' ? handleSendMessage() : null}
                />
                <button 
                    className="p-2 rounded-lg border-none m-2 bg-[#0DF2FF] text-black" 
                    onClick={handleSendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default ChatComponent;
