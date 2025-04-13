'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import leaveIcon from '../../../public/leave.svg';
import chatIcon from '../../../public/chat.svg';
import users from '../../../public/users.svg';
import dot from '../../../public/greenDot.svg';
import cameraOn from '../../../public/cameraOn.svg';
import cameraOff from '../../../public/cameraOff.svg';
import mute from '../../../public/mute.svg';
import unmute from '../../../public/unmute.svg';
import ChatComponent from '../../components/Chat';
import BottomBar from '../../components/bottomBar';
import { useVideoCall } from '../../contexts/VideoCallContext';

const Code = () => {
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [usersOnline, setUsersOnline] = useState(2);
    const [isChatVisible, setIsChatVisible] = useState(false);
    const { isCameraOn, isMicOn, toggleCamera, toggleMicrophone } = useVideoCall();

    const handleSubmit = () => {
        // TODO: Add code execution logic
        setOutput('Code execution result will appear here');
    }

    const toggleChat = () => {
        setIsChatVisible(prev => !prev);
    }

    return (
        <div className='bg-[#0A0F1E] flex flex-col justify-between relative min-h-screen p-2'>
            {/* Top Navigation Bar */}
            <div className='w-full h-12 bg-gray-700 rounded-lg flex items-center p-2'>
                <h1 className='text-white text-lg'>Problem No.</h1>
            </div>

            {/* Main Content Area */}
            <div className='w-full h-162 flex my-2 gap-2'>
                {/* Question Description */}
                <div className='w-1/3 h-full bg-[#1E1E1E] rounded-lg border border-[#0DF2FF] p-4'>
                    <div className='text-white'>
                        Problem Description
                    </div>
                </div>

                {/* Code Editor */}
                <div className='w-1/3 h-full bg-[#1E1E1E] rounded-lg border border-[#0DF2FF] p-4'>
                    <textarea 
                        className='w-full h-[90%] bg-transparent text-white focus:outline-none resize-none'
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder='Write your code here...'
                    />
                    <div className='flex justify-end mt-2'>
                        <button 
                            onClick={handleSubmit}
                            className='bg-[#FF007A] text-white px-6 py-2 rounded-lg hover:shadow-[0px_0px_8px_rgba(13,242,255,1)] transition'
                        >
                            Run Code
                        </button>
                    </div>
                </div>

                {/* Output Section */}
                <div className='w-1/3 h-full bg-[#1E1E1E] rounded-lg border border-[#0DF2FF] p-4'>
                    <pre className='text-white'>
                        {output}
                    </pre>
                </div>
            </div>

            {/* Chat Component Popup */}
            {isChatVisible && (
                <div className='fixed bottom-16 right-4 z-50'>
                    <ChatComponent />
                </div>
            )}

            {/* Bottom Bar */}
            <BottomBar 
                toggleChat={toggleChat} 
                usersOnline={usersOnline}
            />
        </div>
    );
}

export default Code;
