'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import leaveIcon from '../../../public/leave.svg';
import chatIcon from '../../../public/chat.svg';
import users from '../../../public/users.svg';
import dot from '../../../public/greenDot.svg';
import ChatComponent from '../../components/Chat'; // Importing the Chat component

const Code = () => {
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [usersOnline, setUsersOnline] = useState(2);
    const [isChatVisible, setIsChatVisible] = useState(false); // State to manage chat visibility

    const handleSubmit = () => {
        // TODO: Add code execution logic
        setOutput('Code execution result will appear here');
    }

    const toggleChat = () => {
        setIsChatVisible(!isChatVisible); // Toggle chat visibility
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
                    <ChatComponent /> {/* Using the imported Chat component */}
                </div>
            )}

            {/* Bottom Bar */}
            <div className='w-full h-12 bg-gray-900 rounded-lg flex justify-between items-center px-4'>
                {/* Left Side */}
                <div className='flex items-center gap-4'>
                    {/* Logo */}
                    <div className='text-[#0DF2FF] font-bold text-xl'>
                        metaCode
                    </div>
                    
                    {/* User Profile */}
                    <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 rounded-full bg-gray-600'></div>
                        <span className='text-white'>Username</span>
                    </div>

                    {/* Audio/Video Controls */}
                    <div className='flex gap-3'>
                        <button className='p-2 rounded-full bg-gray-700 hover:bg-gray-600'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                            </svg>
                        </button>
                        <button className='p-2 rounded-full bg-gray-700 hover:bg-gray-600'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Right Side */}
                <div className='flex items-center gap-4'>
                    <div onClick={toggleChat} className='cursor-pointer'>
                        <Image 
                            src={chatIcon} 
                            alt="Chat" 
                            className="hover:opacity-80 transition"
                            width={24}
                            height={24}
                        />
                    </div>
                    <div className='flex items-center gap-2'>
                        <Image src={users} alt='usersIcon'/>
                        {<span className='text-white'>{usersOnline} </span>}
                    </div>
                    <Link href="/dashboard">
                        <Image 
                            src={leaveIcon} 
                            alt="Leave Room" 
                            className="cursor-pointer hover:opacity-80 transition"
                            width={28}
                            height={28}
                        />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Code;
