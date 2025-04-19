const express = require('express');
const roomRouter = express.Router();
const { createRoom, getRooms, joinRoom, leaveRoom, joinRoomByInvite } = require('../controllers/room.controller.js');
const verifyUserMiddleware = require('../middleware/userAuth');
const { validateRoomCreation } = require('../middleware/validation');

// Protected routes
roomRouter.post('/', verifyUserMiddleware, createRoom);
roomRouter.get('/', verifyUserMiddleware, getRooms);
roomRouter.post('/:roomId/join', verifyUserMiddleware, joinRoom);
roomRouter.post('/:roomId/leave', verifyUserMiddleware, leaveRoom);
roomRouter.post('/join/invite/:inviteCode', verifyUserMiddleware, joinRoomByInvite);

module.exports = roomRouter;