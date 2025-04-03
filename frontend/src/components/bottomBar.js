'use client'

import React, {useState} from 'react';
import Image from 'next/image';
import chatIcon from '../../public/chat.svg';
import users from '../../public/users.svg';
import leaveIcon from '../../public/leave.svg';
import Link from 'next/link';
import mute from '../../public/mute.svg';
import unmute from '../../public/unmute.svg';
import cameraOn from '../../public/cameraOn.svg';
import cameraOff from '../../public/cameraOff.svg';


const BottomBar = ({toggleChat}) => {
    const [isAudioMuted, setIsAudioMuted] = React.useState(false);
    const [isVideoOn, setIsVideoOn] = React.useState(false);
    const [usersOnline, setUsersOnline] = React.useState(1);
    const [isChatOpen, setIsChatOpen] = React.useState(false);

    const toggleAudio = () => {
        setIsAudioMuted(!isAudioMuted);
        // Add logic to actually mute/unmute audio stream
    };

    const toggleVideo = () => {
        setIsVideoOn(!isVideoOn);
        // Add logic to actually turn video on/off
    };

    const handleChatToggle = () => {
        setIsChatOpen(!isChatOpen);
        toggleChat();
    };

    return (
        <div className='w-full h-12 bg-gray-900 rounded-lg flex justify-between items-center px-4 transition'>
            <div className='flex items-center gap-4'>
                <div className='text-[#0DF2FF] font-bold text-xl'>
                    metaCode
                </div>
                <div className='flex items-center gap-2'>
                    <div className='w-8 h-8 rounded-full bg-gray-600'></div>
                    <span className='text-white'>Username</span>
                </div>
                <div className='flex gap-3'>
                <button onClick={toggleAudio} className='w-15 flex justify-center p-2 rounded-full bg-gray-700 hover:bg-gray-600'>
                    <Image src={isAudioMuted ? unmute : mute} alt='Mute' width={24} height={24} />
                </button>
                <button onClick={toggleVideo} className='w-15 flex justify-center p-2 rounded-full bg-gray-700 hover:bg-gray-600'>
                    <Image src={isVideoOn ? cameraOn : cameraOff} alt='Camera' width={24} height={24} />
                </button>
                </div>
            </div>
            <div className='flex items-center gap-4'>
                    <button onClick={handleChatToggle} className='w-15 flex justify-center p-2 rounded-full bg-gray-700 hover:bg-gray-600'>
                        <Image src={chatIcon} alt='Chat' width={24} height={24} />
                    </button>
                    <button className='p-2 flex gap-2 rounded-full bg-gray-700 hover:bg-gray-600'>
                        <Image src={users} alt='usersIcon' width={24} height={24} />
                        <span className='text-white'>{usersOnline}</span>
                    </button>
                <Link href="/dashboard">
                    <button className='p-2 rounded-full bg-gray-700 hover:bg-gray-600'>
                        <Image src={leaveIcon} alt='Leave Room' width={28} height={28} />
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default BottomBar;