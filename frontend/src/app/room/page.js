'use client'

import React from 'react';
import BottomBar from '../../components/bottomBar'; // Import the BottomBar component
import Image from 'next/image';
import ChatBox from '../../components/Chat';   
import dynamic from 'next/dynamic';
import SnakeGame from '@/components/SnakeGame';
// Dynamically import the Environment component with SSR turned off
const Environment = dynamic(() => import('@/components/Environment'), { ssr: false });

const room = () => {
    const [showChat, setShowChat] = React.useState(false);
    const [showGame, setShowGame] = React.useState(false);

    const toggleChat = () => {
        setShowChat(prev => !prev);
    }

    const toggleGame = () => {
        setShowGame(prev => !prev);
    }

    return (
        <>
        <div className='bg-[#0A0F1E] flex flex-col justify-between relative min-h-screen p-2'>
        <div className='w-full h-12 rounded-md bg-gray-700'>
            
        </div>
        <div className='w-full h-162 flex my-2 rounded-lg gap-2 transition-all'>
            <div className='relative w-full h-162 flex rounded-lg gap-2'>
                <Environment/>
            </div>
            {showChat && <ChatBox />}
            {showGame && (
                <div className='absolute top-0 right-0 w-1/3 h-full bg-[#1e1e1e] rounded-lg overflow-hidden'>
                    <SnakeGame />
                </div>
            )}
        </div>
        <BottomBar toggleChat={toggleChat} /> 
        </div>
        </>
    );
}

export default room;
