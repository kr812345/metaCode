"use client";
import React, { useEffect } from 'react';
import { useVideoCall } from '../contexts/VideoCallContext';
import { useRoom } from '../contexts/RoomContext';
import BottomBar from './bottomBar';

const VideoCall = () => {
    const {
        localStream,
        remoteStreams,
        localVideoRef,
        remoteVideoRefs,
        isCameraOn,
        isMicOn,
        initiateCall,
        setCurrentRoom,
        socket
    } = useVideoCall();

    const { currentRoom, roomMembers, isLoading, error } = useRoom();

    useEffect(() => {
        if (currentRoom) {
            setCurrentRoom(currentRoom.id);
        }
    }, [currentRoom, setCurrentRoom]);

    useEffect(() => {
        const handleRemoteVideoState = ({ userId, isCameraOn }) => {
            const videoElement = remoteVideoRefs.current[userId];
            if (videoElement) {
                videoElement.style.display = isCameraOn ? 'block' : 'none';
            }
        };

        socket?.on('remote-video-state-changed', handleRemoteVideoState);

        return () => {
            socket?.off('remote-video-state-changed', handleRemoteVideoState);
        };
    }, [socket]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-full">
            <div className="text-white">Loading video call...</div>
        </div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-full">
            <div className="text-red-500">Error: {error}</div>
        </div>;
    }

    if (!currentRoom) {
        return <div className="flex items-center justify-center h-full">
            <div className="text-white">Please join a room first</div>
        </div>;
    }

    return (
        <div className="h-full flex flex-col bg-[#0A0F1E]">
            <div className="p-4 bg-[#0A2342] flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#0DF2FF]">Video Call</h2>
                <div className="flex space-x-2">
                    {roomMembers.map((member) => (
                        <div 
                            key={member.userId} 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white cursor-pointer"
                            style={{ backgroundColor: member.avatar?.color || '#3498db' }}
                            title={`Call ${member.name}`}
                            onClick={() => initiateCall(member)}
                        >
                            {member.name[0].toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-auto">
                {/* Local Video */}
                <div className="bg-[#0A2342] rounded-lg overflow-hidden relative">
                    <video 
                        ref={localVideoRef} 
                        autoPlay 
                        muted 
                        className="w-full h-full object-cover"
                        style={{ display: isCameraOn ? 'block' : 'none' }}
                    />
                    {!isCameraOn && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#0A2342]">
                            <img src="/cameraOff.svg" alt="Camera Off" className="w-16 h-16" />
                        </div>
                    )}
                    <div className="absolute bottom-2 left-2 text-white">
                        You
                    </div>
                </div>

                {/* Remote Videos */}
                {Object.entries(remoteStreams).map(([userId, stream]) => (
                    <div key={userId} className="bg-[#0A2342] rounded-lg overflow-hidden relative">
                        <video 
                            ref={el => remoteVideoRefs.current[userId] = el}
                            srcObject={stream}
                            autoPlay 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 text-white">
                            {roomMembers.find(m => m.userId === userId)?.name || 'Remote Participant'}
                        </div>
                    </div>
                ))}
            </div>

            <BottomBar 
                toggleChat={() => {}} // Add chat toggle functionality if needed
                onLeaveRoom={() => {}} // Leave room is handled by the context
            />
        </div>
    );
};

export default VideoCall;
