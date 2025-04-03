const Room = require('../models/room.model');

// Create a new room
const createRoom = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user.user; // From JWT token

        if (!name) {
            return res.status(400).json({ 
                success: false,
                message: "Room name is required" 
            });
        }

        const newRoom = new Room({
            name,
            description,
            creator: userId,
            members: [{
                user: userId,
                role: 'owner'
            }]
        });

        await newRoom.save();

        res.status(201).json({
            success: true,
            message: "Room created successfully",
            room: {
                id: newRoom._id,
                name: newRoom.name,
                description: newRoom.description,
                creator: newRoom.creator,
                members: newRoom.members,
                memberCount: newRoom.memberCount,
                createdAt: newRoom.createdAt,
                updatedAt: newRoom.updatedAt
            }
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ 
            success: false,
            message: "Error creating room" 
        });
    }
};

// Get all rooms for a user
const getRooms = async (req, res) => {
    try {
        const userId = req.user.user;
        const rooms = await Room.find({ 
            $or: [
                { creator: userId },
                { 'members.user': userId }
            ]
        })
        .populate('creator', 'name email')
        .populate('members.user', 'name email');

        res.status(200).json({
            success: true,
            message: "Rooms fetched successfully",
            rooms: rooms.map(room => ({
                id: room._id,
                name: room.name,
                description: room.description,
                creator: room.creator,
                members: room.members,
                memberCount: room.memberCount,
                createdAt: room.createdAt,
                updatedAt: room.updatedAt
            }))
        });
    } catch (error) {
        console.error('Get rooms error:', error);
        res.status(500).json({ 
            success: false,
            message: "Error fetching rooms" 
        });
    }
};

// Join a room
const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.user;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ 
                success: false,
                message: "Room not found" 
            });
        }

        if (room.isMember(userId)) {
            return res.status(400).json({ 
                success: false,
                message: "Already a member of this room" 
            });
        }

        await room.addMember(userId, 'viewer');

        res.status(200).json({
            success: true,
            message: "Joined room successfully",
            room: {
                id: room._id,
                name: room.name,
                description: room.description,
                creator: room.creator,
                members: room.members,
                memberCount: room.memberCount,
                createdAt: room.createdAt,
                updatedAt: room.updatedAt
            }
        });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({ 
            success: false,
            message: "Error joining room" 
        });
    }
};

// Leave a room
const leaveRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.user;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ 
                success: false,
                message: "Room not found" 
            });
        }

        if (!room.isMember(userId)) {
            return res.status(400).json({ 
                success: false,
                message: "Not a member of this room" 
            });
        }

        // Prevent owner from leaving
        if (room.getMemberRole(userId) === 'owner') {
            return res.status(400).json({ 
                success: false,
                message: "Room owner cannot leave the room" 
            });
        }

        await room.removeMember(userId);

        res.status(200).json({
            success: true,
            message: "Left room successfully"
        });
    } catch (error) {
        console.error('Leave room error:', error);
        res.status(500).json({ 
            success: false,
            message: "Error leaving room" 
        });
    }
};

module.exports = {
    createRoom,
    getRooms,
    joinRoom,
    leaveRoom
}; 