'use client';
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { useRoom } from './RoomContext';

const VideoCallContext = createContext();

export const VideoCallProvider = ({ children }) => {
    const { socket, isConnected } = useSocket();
    const { user } = useAuth();
    const { currentRoom } = useRoom();
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({});
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});
    const [currentRoomId, setCurrentRoomId] = useState(null);

    useEffect(() => {
        if (currentRoom) {
            setCurrentRoomId(currentRoom.id);
        }
    }, [currentRoom]);

    useEffect(() => {
        if (!isConnected || !socket) return;

        const handleCallReceived = async (data) => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                socket.emit("accept-call", { 
                    callerId: data.callerId,
                    roomId: currentRoomId
                });
            } catch (err) {
                console.error("Error accessing media devices:", err);
            }
        };

        const handleCallAccepted = (data) => {
            setRemoteStreams(prev => ({
                ...prev,
                [data.callerId]: data.stream
            }));
        };

        socket.on("call-received", handleCallReceived);
        socket.on("call-accepted", handleCallAccepted);

        return () => {
            socket.off("call-received", handleCallReceived);
            socket.off("call-accepted", handleCallAccepted);
        };
    }, [isConnected, socket, currentRoomId]);

    const initiateCall = async (targetUser) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            socket.emit("initiate-call", { 
                targetUserId: targetUser.userId,
                roomId: currentRoomId
            });
        } catch (err) {
            console.error("Error accessing media devices:", err);
        }
    };

    const toggleCamera = async () => {
        try {
            if (!localStream) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isMicOn });
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                setIsCameraOn(true);
            } else {
                const videoTrack = localStream.getVideoTracks()[0];
                if (videoTrack) {
                    if (isCameraOn) {
                        videoTrack.enabled = false;
                        setIsCameraOn(false);
                    } else {
                        videoTrack.enabled = true;
                        setIsCameraOn(true);
                    }
                }
            }
        } catch (err) {
            console.error("Error toggling camera:", err);
        }
    };

    const toggleMicrophone = async () => {
        try {
            if (!localStream) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: isCameraOn, audio: true });
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                setIsMicOn(true);
            } else {
                const audioTrack = localStream.getAudioTracks()[0];
                if (audioTrack) {
                    if (isMicOn) {
                        audioTrack.enabled = false;
                        setIsMicOn(false);
                    } else {
                        audioTrack.enabled = true;
                        setIsMicOn(true);
                    }
                }
            }
        } catch (err) {
            console.error("Error toggling microphone:", err);
        }
    };

    const endCall = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        setRemoteStreams({});
        setIsCameraOn(true);
        setIsMicOn(true);
    };

    const value = {
        localStream,
        remoteStreams,
        localVideoRef,
        remoteVideoRefs,
        isCameraOn,
        isMicOn,
        initiateCall,
        toggleCamera,
        toggleMicrophone,
        endCall
    };

    return (
        <VideoCallContext.Provider value={value}>
            {children}
        </VideoCallContext.Provider>
    );
};

export const useVideoCall = () => {
    const context = useContext(VideoCallContext);
    if (!context) {
        throw new Error('useVideoCall must be used within a VideoCallProvider');
    }
    return context;
}; 