import { useRef, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import SnakeGame from './SnakeGame';

const socket = io("http://localhost:4000", { autoConnect: false });

const PixelatedRoom = () => {
  const canvasRef = useRef(null);
  const pixelSize = 10;
  const [players, setPlayers] = useState({});
  const [avatar, setAvatar] = useState({ 
    x: 100, 
    y: 100, 
    color: "#3498db", 
    name: "You" 
  });
  const [isConnected, setIsConnected] = useState(false);
  const [showGame, setShowGame] = useState(false);

  const walls = [
    { x: 0, y: 0, width: 500, height: 20 },
    { x: 0, y: 380, width: 500, height: 20 },
    { x: 0, y: 0, width: 20, height: 400 },
    { x: 480, y: 0, width: 20, height: 400 },
    // Game area wall
    { x: 300, y: 100, width: 20, height: 200 },
  ];

  const chairs = [
    { x: 100, y: 150 },
    { x: 200, y: 250 },
  ];

  // Game area
  const gameArea = {
    x: 320,
    y: 100,
    width: 160,
    height: 200
  };

  useEffect(() => {
    socket.connect();
    setIsConnected(socket.connected);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleCurrentPlayers = (serverPlayers) => setPlayers(serverPlayers);
    const handleNewPlayer = ({ id, player }) => setPlayers((prev) => ({ ...prev, [id]: player }));
    const handlePlayerMoved = ({ id, position }) =>
      setPlayers((prev) => ({ ...prev, [id]: { ...prev[id], ...position } }));
    const handlePlayerLeft = (id) =>
      setPlayers((prev) => {
        const updatedPlayers = { ...prev };
        delete updatedPlayers[id];
        return updatedPlayers;
      });

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("currentPlayers", handleCurrentPlayers);
    socket.on("newPlayer", handleNewPlayer);
    socket.on("playerMoved", handlePlayerMoved);
    socket.on("playerLeft", handlePlayerLeft);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("currentPlayers", handleCurrentPlayers);
      socket.off("newPlayer", handleNewPlayer);
      socket.off("playerMoved", handlePlayerMoved);
      socket.off("playerLeft", handlePlayerLeft);
    };
  }, []);

  const drawRoom = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#d4a373";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#2c3e50";
    walls.forEach((wall) => {
      ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });

    ctx.fillStyle = "#8b4513";
    chairs.forEach((chair) => {
      ctx.fillRect(chair.x, chair.y, 20, 20);
    });

    // Draw game area
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(gameArea.x, gameArea.y, gameArea.width, gameArea.height);
    ctx.fillStyle = "#0DF2FF";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Snake Game", gameArea.x + gameArea.width/2, gameArea.y - 5);

    if (!isConnected) {
      ctx.fillStyle = avatar.color;
      ctx.fillRect(avatar.x, avatar.y, pixelSize * 2, pixelSize * 2);
      ctx.fillStyle = "black";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(avatar.name, avatar.x + pixelSize, avatar.y - 5);
    } else {
      Object.entries(players).forEach(([id, player]) => {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, pixelSize * 2, pixelSize * 2);
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(player.name, player.x + pixelSize, player.y - 5);
      });
    }

    requestAnimationFrame(drawRoom);
  }, [players, isConnected, avatar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 500;
      canvas.height = 400;
    }
    drawRoom();
  }, [drawRoom]);

  const handleKeyDown = (e) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;

    setAvatar((prev) => {
      if (!prev) return { x: 100, y: 100, color: "#3498db", name: "You" };
      
      const newPosition = {
        ...prev,
        x: prev.x + (e.key === "ArrowLeft" ? -pixelSize : e.key === "ArrowRight" ? pixelSize : 0),
        y: prev.y + (e.key === "ArrowUp" ? -pixelSize : e.key === "ArrowDown" ? pixelSize : 0),
      };

      // Check if player is entering game area
      if (
        newPosition.x >= gameArea.x - pixelSize * 2 &&
        newPosition.x <= gameArea.x + gameArea.width &&
        newPosition.y >= gameArea.y - pixelSize * 2 &&
        newPosition.y <= gameArea.y + gameArea.height
      ) {
        setShowGame(true);
        return prev;
      } else {
        setShowGame(false);
      }

      for (let wall of walls) {
        if (
          newPosition.x < wall.x + wall.width &&
          newPosition.x + pixelSize * 2 > wall.x &&
          newPosition.y < wall.y + wall.height &&
          newPosition.y + pixelSize * 2 > wall.y
        ) {
          return prev;
        }
      }

      newPosition.x = Math.max(0, Math.min(canvasRef.current.width - pixelSize * 2, newPosition.x));
      newPosition.y = Math.max(0, Math.min(canvasRef.current.height - pixelSize * 2, newPosition.y));

      if (isConnected) socket.emit("move", newPosition);
      return newPosition;
    });
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="border border-black" />
      {showGame && (
        <div 
          className="absolute top-[100px] right-[20px] w-[160px] h-[200px] bg-[#1e1e1e] rounded-lg overflow-hidden"
          style={{ zIndex: 10 }}
        >
          <SnakeGame />
        </div>
      )}
    </div>
  );
};

export default PixelatedRoom;
