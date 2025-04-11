const express = require('express');
<<<<<<< HEAD
const http = require("http");
const { Server } = require("socket.io");
const cors = require('cors');
require('dotenv').config();
const appRoutes = require('./routes/v1routes');
const dbConnect = require('./db/db');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
=======
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
const result = dotenv.config();
if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);
}

// Debug: Check if environment variables are loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
console.log('PORT:', process.env.PORT || 'Using default (3000)');

const app = express();
>>>>>>> e6e6c04309923209261b7a64127cbbe6897dbe27

app.use(cors());
app.use(express.json()); 

<<<<<<< HEAD
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
=======
// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
console.log('MONGODB_URI:', MONGODB_URI ? 'Found' : 'Not found');

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('MongoDB Connected');
        
        // Drop and recreate the users collection
        try {
            await mongoose.connection.collection('users').drop();
            console.log('Users collection dropped successfully');
        } catch (err) {
            if (err.code === 26) {
                console.log('Users collection does not exist, creating new one');
            } else {
                console.error('Error dropping users collection:', err);
            }
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
>>>>>>> e6e6c04309923209261b7a64127cbbe6897dbe27
    });

// Routes
const authRoutes = require('./routes/auth.routes');
const roomRoutes = require('./routes/room.routes');
const questionRoutes = require('./routes/question.routes');

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/questions', questionRoutes);

app.get('/', (req, res) => {
    res.send('API is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));