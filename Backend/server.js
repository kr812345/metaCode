const express = require('express');
const http = require("http");
const { Server } = require("socket.io");
const cors = require('cors');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();
const dbConnect = require('./db/db');
const { verifyUserMiddleware } = require('./middleware/userAuth');
const jwt = require('jsonwebtoken');
const User = require('./models/user.model');
const Room = require('./models/room.model');
const CodeSession = require("./models/codeSession")

const app = express();
const server = http.createServer(app);

// Logging Configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
            frameSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
        },
    },
}));
app.use(compression()); // Compress response bodies

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', apiLimiter);

// CORS Configuration
allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://mallard-tidy-rhino.ngrok-free.app'
]
app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
}));

app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const port = process.env.PORT || 3001;

// Debug: Check if environment variables are loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
console.log('PORT:', process.env.PORT || 'Using default (3001)');

// Socket.IO Configuration
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000/",
        methods: ["GET", "POST"],
        credentials: true,
    },
    pingTimeout: 60000, // Increased timeout
    pingInterval: 25000 // Increased interval
});

// Function to generate a random color
const getRandomColor = () => {
    const colors = ["#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4"];
    return colors[Math.floor(Math.random() * colors.length)];
};

const players = {}; // Global players tracking

// Socket Authentication Middleware
const socketAuthMiddleware = async (socket, next) => {
    let token = socket.handshake.auth.token;

    // If no token in auth, try cookies
    if (!token && socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});
        token = cookies.token;
    }
    
    if (!token) {
        logger.error('No authentication token provided');
        return next(new Error('Authentication error: No token'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.user).select('-password');
        
        if (!user) {
            logger.error('User not found for token');
            return next(new Error('Authentication error: User not found'));
        }

        socket.user = user;
        next();
    } catch (error) {
        logger.error('Socket authentication failed', { error: error.message });
        return next(new Error('Authentication error'));
    }
};

// Socket Event Handlers
const setupSocketEventHandlers = (socket) => {
    // Room Management
    socket.on("join-room", async (roomId) => {
        try {
            const room = await Room.findById(roomId);
            
            if (!room) {
                socket.emit("room-error", "Room not found");
                logger.warn(`Attempt to join non-existent room: ${roomId}`);
                return;
            }
            // console.log(socket);
            // Check room capacity and permissions
            if (room.members.length >= room.maxParticipants) {
                socket.emit("room-error", "Room is full");
                logger.warn(`Room capacity exceeded: ${roomId}`);
                return;
            }

            socket.join(roomId);
            
            // Update user's current room
            await User.findByIdAndUpdate(socket.user._id, { 
                currentRoom: roomId,
                status: 'in-room',
                lastActive: new Date()
            });

            // Add user to room members if not already present
            if (!room.members.some(member => member.user._id.equals(socket.user._id))) {
                room.members.push(socket.user._id);
                await room.save();
            }

            // Broadcast to other users in the room
            socket.to(roomId).emit("user-entered", {
                userId: socket.user._id,
                name: socket.user.name,
                avatar: socket.user.avatar,
                color: getRandomColor()
            });

            // Send room details to the joining user
            socket.emit("room-joined", {
                roomId,
                name: room.name,
                description: room.description,
                members: room.members,
                code: await getLatestRoomCode(roomId)
            });

            logger.info(`User ${socket.user.name} joined room ${roomId}`);
        } catch (error) {
            logger.error('Error joining room', { error: error.message, roomId });
            socket.emit("room-error", "Error joining room");
        }
    });

    // Retrieve Latest Room Code
    const getLatestRoomCode = async (roomId) => {
        const codeSession = await CodeSession.findOne({ roomId })
            .sort({ createdAt: -1 })
            .limit(1);
        return codeSession ? codeSession.code : '';
    };

    // Avatar Movement with Validation
    socket.on("avatar-move", (moveData) => {
        const { roomId, x, y, direction } = moveData;
        
        // Basic validation
        if (!roomId || typeof x !== 'number' || typeof y !== 'number') {
            logger.warn('Invalid avatar move data', { moveData });
            return;
        }

        // Broadcast movement to other users in the same room
        socket.to(roomId).emit("avatar-moved", {
            userId: socket.user._id,
            x,
            y,
            direction
        });
    });

    // Coding Collaboration with Persistence
    socket.on("code-update", async (codeData) => {
        const { roomId, code, language } = codeData;
        
        try {
            // Persist code session
            await CodeSession.create({
                roomId,
                userId: socket.user._id,
                code,
                language,
                createdAt: new Date()
            });

            // Broadcast code changes to other users in the room
            socket.to(roomId).emit("code-updated", {
                userId: socket.user._id,
                code,
                language
            });

            logger.info(`Code updated in room ${roomId}`);
        } catch (error) {
            logger.error('Error updating code', { error: error.message });
        }
    });

    // Enhanced Chat Messaging
    socket.on("send-message", async (messageData) => {
        const { roomId, message } = messageData;

        // Basic message validation
        if (!message || message.trim().length === 0) {
            logger.warn('Attempted to send empty message');
            return;
        }

        try {
            // Broadcast chat message to room
            const chatMessage = {
                userId: socket.user._id,
                name: socket.user.name,
                avatar: socket.user.avatar,
                message,
                timestamp: new Date(),
                color: getRandomColor()
            };

            io.to(roomId).emit("message-received", chatMessage);
            
            logger.info(`Message sent in room ${roomId}`);
        } catch (error) {
            logger.error('Error sending message', { error: error.message });
        }
    });

    // Video Call Management
    socket.on("video-state-changed", async ({ userId, isCameraOn }) => {
        try {
            const rooms = Array.from(socket.rooms);
            rooms.forEach(roomId => {
                if (roomId !== socket.id) {
                    socket.to(roomId).emit("remote-video-state-changed", {
                        userId,
                        isCameraOn
                    });
                }
            });
            logger.info(`Video state changed for user ${socket.user.name}: camera ${isCameraOn ? 'on' : 'off'}`);
        } catch (error) {
            logger.error('Error handling video state change', { error: error.message });
        }
    });

    // Leave Room Handling
    socket.on("leave-room", async (roomId) => {
        try {
            // Update user status
            await User.findByIdAndUpdate(socket.user._id, { 
                currentRoom: null,
                status: 'online',
                lastActive: new Date()
            });
    
            // Notify room about user leaving
            socket.to(roomId).emit("user-left", {
                userId: socket.user._id,
                name: socket.user.name
            });
    
            // ✅ FIX: Use socket.user._id correctly
            await Room.findByIdAndUpdate(
                roomId,
                {
                    $pull: {
                        members: socket.user._id
                    }
                });
    
            socket.leave(roomId);
            logger.info(`User ${socket.user.name} left room ${roomId}`);
        } catch (error) {
            logger.error('Error leaving room', { error: error.message });
        }
    });
    

    // Disconnect Handling with Comprehensive Cleanup
    socket.on("disconnect", async () => {
        if (socket.user) {
            try {
                // Update user status
                await User.findByIdAndUpdate(socket.user._id, { 
                    status: 'offline',
                    currentRoom: null,
                    lastActive: new Date()
                });

                // Notify rooms about user leaving
                for (const roomId of socket.rooms) {
                    if (roomId !== socket.id) {
                        socket.to(roomId).emit("user-left", {
                            userId: socket.user._id,
                            name: socket.user.name
                        });
                    }
                }

                logger.info(`User ${socket.user.name} disconnected`);
            } catch (error) {
                logger.error('Error during disconnect', { error: error.message });
            }
        }
    });
};

// Socket Connection Handler
io.use(socketAuthMiddleware);
io.on("connection", (socket) => {
    logger.info(`New socket connection: ${socket.id}`);
    setupSocketEventHandlers(socket);
});

// Database connection
dbConnect();

// Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error(err.message, { 
        stack: err.stack,
        method: req.method,
        path: req.path
    });

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Protected route example
// app.get('/api/protected', verifyUserMiddleware, (req, res) => {
//     res.status(200).json({ 
//         success: true, 
//         message: 'You have access to protected route',
//         user: req.user
//     });
// });

// Routes
const authRoutes = require('./routes/auth.routes');
const roomRoutes = require('./routes/room.routes');
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

app.get('/', (req, res) => {
    res.send('API is running.');
});

server.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    console.log(`Server running on port ${port}`);
});

module.exports = { app, server, io };