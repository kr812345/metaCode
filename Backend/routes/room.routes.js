const express = require('express');
const roomRouter = express.Router();
const { createRoom, getRooms, joinRoom, leaveRoom, joinRoomByInvite } = require('../controllers/room.controller.js');
const verifyUserMiddleware = require('../middleware/userAuth');
const { validateRoomCreation } = require('../middleware/validation');
const Room = require('../models/room.model');

// Protected routes
roomRouter.post('/', verifyUserMiddleware, createRoom);
roomRouter.get('/', verifyUserMiddleware, getRooms);
roomRouter.post('/:roomId/join', verifyUserMiddleware, joinRoom);
roomRouter.post('/:roomId/leave', verifyUserMiddleware, leaveRoom);
roomRouter.post('/join/invite/:inviteCode', verifyUserMiddleware, joinRoomByInvite);

// Get invite link for a room
roomRouter.get('/:roomId/invite', verifyUserMiddleware, async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check if user is a member of the room
        const isMember = room.members.some(member => member.user.equals(req.user._id));
        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this room' });
        }

        const inviteLink = `${process.env.FRONTEND_URL}/join/${room.inviteCode}`;
        res.json({ inviteLink });
    } catch (error) {
        res.status(500).json({ message: 'Error generating invite link', error: error.message });
    }
});

// Join room using invite code
roomRouter.post('/join/:inviteCode', verifyUserMiddleware, async (req, res) => {
    try {
        const room = await Room.findOne({ inviteCode: req.params.inviteCode });
        if (!room) {
            return res.status(404).json({ message: 'Invalid invite code' });
        }

        // Check if user is already a member
        const isAlreadyMember = room.members.some(member => member.user.equals(req.user._id));
        if (isAlreadyMember) {
            return res.status(400).json({ message: 'You are already a member of this room' });
        }

        // Add user to room members
        room.members.push({
            user: req.user._id,
            role: 'viewer'
        });

        await room.save();
        res.json({ roomId: room._id, message: 'Successfully joined the room' });
    } catch (error) {
        res.status(500).json({ message: 'Error joining room', error: error.message });
    }
});

module.exports = roomRouter;