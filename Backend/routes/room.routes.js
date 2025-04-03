const express = require('express');
const router = express.Router();
const { verifyUserMiddleware } = require('../middleware/userAuth');
const { 
    createRoom, 
    getRooms, 
    joinRoom,
    leaveRoom 
} = require('../controllers/room.controller');

// Apply authentication middleware to all routes
router.use(verifyUserMiddleware);

// Create a new room
router.post('/createRoom', createRoom);

// Get all rooms for the user
router.get('/getRooms', getRooms);

// Join a room
router.post('/joinRoom/:roomId', joinRoom);

// Leave a room
router.post('/leaveRoom/:roomId', leaveRoom);

module.exports = router; 