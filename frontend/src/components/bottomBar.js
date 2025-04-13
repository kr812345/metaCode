'use client'

import React, {useState} from 'react';
import Image from 'next/image';
import chatIcon from '../../public/chat.svg';
import users from '../../public/users.svg';
import leaveIcon from '../../public/leave.svg';
import mute from '../../public/mute.svg';
import unmute from '../../public/unmute.svg';
import cameraOn from '../../public/cameraOn.svg';
import cameraOff from '../../public/cameraOff.svg';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useVideoCall } from '../contexts/VideoCallContext';

const BottomBar = ({toggleChat, onLeaveRoom}) => {
    const [usersOnline, setUsersOnline] = useState(1);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const router = useRouter();
    const {
        isCameraOn,
        isMicOn,
        toggleCamera,
        toggleMicrophone,
        endCall
    } = useVideoCall();

    const handleChatToggle = () => {
        setIsChatOpen(!isChatOpen);
        toggleChat();
    };

    const handleLeaveRoom = () => {
        if (onLeaveRoom) {
            onLeaveRoom();
        } else {
            endCall();
            localStorage.removeItem('roomId');
            localStorage.removeItem('roomName');
            toast.success('Left room successfully!');
            router.push('/dashboard');
        }
    };

    const handleToggleAudio = () => {
        console.log('Toggling audio, current state:', isMicOn);
        toggleMicrophone();
    };

    const handleToggleVideo = () => {
        console.log('Toggling video, current state:', isCameraOn);
        toggleCamera();
    };

    return (
        <div className='w-full h-12 bg-[#0C1738] rounded-lg flex justify-between items-center px-4 transition shadow-[0px_0px_5px_rgba(72,70,70,1)]'>
            <div className='flex items-center gap-4'>
                <div className='text-[#0DF2FF] font-bold text-xl'>
                    metaCode
                </div>
                <div className='flex items-center gap-2'>
                    <div className='w-8 h-8 rounded-full bg-gray-600'></div>
                    <span className='text-white'>Username</span>
                </div>
                <div className='flex gap-3'>
                    <button 
                        onClick={handleToggleAudio} 
                        className='w-15 flex justify-center p-2 rounded-full bg-[#0A0F1E] hover:bg-[#0c1738c8] transition'
                    >
                        <Image src={isMicOn ? mute : unmute} alt='Mute' width={24} height={24} />
                    </button>
                    <button 
                        onClick={handleToggleVideo} 
                        className='w-15 flex justify-center p-2 rounded-full bg-[#0A0F1E] hover:bg-[#0c1738c8] transition'
                    >
                        <Image src={isCameraOn ? cameraOn : cameraOff} alt='Camera' width={24} height={24} />
                    </button>
                </div>
            </div>
            <div className='flex items-center gap-4'>
                <button onClick={handleChatToggle} className='w-15 flex justify-center p-2 rounded-full bg-[#0A0F1E] hover:bg-[#0c1738c8] transition'>
                    <Image src={chatIcon} alt='Chat' width={24} height={24} />
                </button>
                <button className='p-2 flex gap-2 rounded-full bg-[#0A0F1E] hover:bg-[#0c1738c8] transition'>
                    <Image src={users} alt='usersIcon' width={24} height={24} />
                    <span className='text-white'>{usersOnline}</span>
                </button>
                <button onClick={handleLeaveRoom} className='p-2 rounded-full bg-[#0A0F1E] hover:bg-[#0c1738c8] transition'>
                    <Image src={leaveIcon} alt='Leave Room' width={28} height={28} />
                </button>
            </div>
        </div>
    );
}

export default BottomBar;