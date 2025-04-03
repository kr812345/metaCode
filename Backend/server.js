const express = require('express');
const http = require("http");
const { Server } = require("socket.io");
const cors = require('cors');
require('dotenv').config();
const appRoutes = require('./routes/v1routes');
const dbConnect = require('./db/db');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  
  // Function to generate a random color
const getRandomColor = () => {
  const colors = ["#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4"];
  return colors[Math.floor(Math.random() * colors.length)];
};

  const rooms = {}; // Store users in rooms
  
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
  
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      if (!rooms[roomId]) rooms[roomId] = [];
      rooms[roomId].push(socket.id);
  
      // Notify others in the room
      socket.to(roomId).emit("user-joined", socket.id);
    });
  
    socket.on("offer", ({ sdp, target, roomId }) => {
      socket.to(target).emit("offer", { sdp, sender: socket.id, roomId });
    });
  
    socket.on("answer", ({ sdp, target }) => {
      socket.to(target).emit("answer", { sdp, sender: socket.id });
    });
  
    socket.on("ice-candidate", ({ candidate, target }) => {
      socket.to(target).emit("ice-candidate", { candidate, sender: socket.id });
    });
  
    // Assign random color to the player
  players[socket.id] = {
    x: 100,
    y: 100,
    color: getRandomColor(),
    name: `Player ${socket.id.slice(-4)}`, // Last 4 chars of ID as a name
  };

  socket.emit("currentPlayers", players);
  socket.broadcast.emit("newPlayer", { id: socket.id, player: players[socket.id] });

  // Handle movement
  socket.on("move", (position) => {
    if (players[socket.id]) {
      players[socket.id].x = position.x;
      players[socket.id].y = position.y;
      io.emit("playerMoved", { id: socket.id, position });
    }
  });

    socket.on("disconnect", () => {
      for (let room in rooms) {
        rooms[room] = rooms[room].filter((id) => id !== socket.id);
        socket.to(room).emit("user-left", socket.id);
      }
      delete players[socket.id];
      io.emit("playerLeft", socket.id);
      console.log("User disconnected:", socket.id);
    });
  });

// Database connection
dbConnect();

//Routes
app.use('/', appRoutes);

// Protected route example
app.get('/api/protected', verifyUserMiddleware, (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'You have access to protected route',
        user: req.user
    });
});

// Handle 404 - Route not found
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});


// Start Server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
