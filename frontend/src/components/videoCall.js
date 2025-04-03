"use client";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function VideoCall({ roomId }) {
  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef({});
  const peersRef = useRef({});
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const initCall = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;

      socket.emit("join-room", roomId);

      socket.on("user-joined", (userId) => {
        setUsers((prev) => [...prev, userId]);
        createOffer(userId, stream);
      });

      socket.on("offer", async ({ sdp, sender }) => {
        const peerConnection = createPeerConnection(sender, stream);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit("answer", { sdp: answer, target: sender });
      });

      socket.on("answer", async ({ sdp, sender }) => {
        await peersRef.current[sender].setRemoteDescription(new RTCSessionDescription(sdp));
      });

      socket.on("ice-candidate", async ({ candidate, sender }) => {
        await peersRef.current[sender].addIceCandidate(new RTCIceCandidate(candidate));
      });

      socket.on("user-left", (userId) => {
        setUsers((prev) => prev.filter((id) => id !== userId));
        if (peersRef.current[userId]) {
          peersRef.current[userId].close();
          delete peersRef.current[userId];
        }
      });
    };

    const createPeerConnection = (userId, stream) => {
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { candidate: event.candidate, target: userId });
        }
      };

      peerConnection.ontrack = (event) => {
        if (!remoteVideosRef.current[userId]) {
          remoteVideosRef.current[userId] = event.streams[0];
          setUsers((prev) => [...prev, userId]);
        }
      };

      peersRef.current[userId] = peerConnection;
      return peerConnection;
    };

    const createOffer = async (userId, stream) => {
      const peerConnection = createPeerConnection(userId, stream);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit("offer", { sdp: offer, target: userId, roomId });
    };

    initCall();
  }, [roomId]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap gap-4">
        <video ref={localVideoRef} autoPlay playsInline className="w-1/3 border" />
        {users.map((userId) => (
          <video
            key={userId}
            ref={(el) => (remoteVideosRef.current[userId] = el)}
            autoPlay
            playsInline
            className="w-1/3 border"
          />
        ))}
      </div>
    </div>
  );
}
