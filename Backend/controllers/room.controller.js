const roomModel = require('../models/room.model.js');

// Create a new room
const createRoom = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user.user; // From JWT token

        if (!name) {
            res.status(400).json({ 
                success: false,
                message: "Room name is required" 
            });
            return 0;
        }

        const newRoom = new roomModel({
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
        return 0;
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
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }
        const rooms = await roomModel.find({ 
            $or: [
                { creator: userId },
                { 'members.user': userId }
            ]
        })
        .lean()
        .populate('creator', 'name email')
        .populate('members.user', 'name email')
        .exec();

        res.status(200).json({
            success: true,
            message: "Rooms fetched successfully",
            rooms: rooms.map(room => ({
                id: room._id,
                name: room.name,
                description: room.description,
                creator: room.creator,
                members: room.members,
                inviteCode: room.inviteCode,
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

        console.log([userId,roomId]);
        const room = await roomModel.findById(roomId);
        console.log(room);
        if (!room) {
            return res.status(404).json({ 
                success: false,
                message: "Room not found" 
            });
        }

        // Skip membership check if user is the creator
        if (room.creator.toString() !== userId.toString() && room.members.some(member => member.user.toString() === userId.toString())) {
            return res.status(400).json({ 
                success: false,
                message: "Already a member of this room" 
            });
        }

        // Add member manually if addMember is not defined
        room.members.push({ user: userId, role: 'viewer' });
        await room.save();

        res.status(200).json({
            success: true,
            message: "Joined room successfully",
            room: {
                id: room._id,
                name: room.name,
                description: room.description,
                creator: room.creator,
                members: room.members,
                inviteCode: room.inviteCode,
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

// Join a room using invite code
const joinRoomByInvite = async (req, res) => {
    try {
        const { inviteCode } = req.params;
        const userId = req.user.user;

        const room = await roomModel.findOne({ inviteCode });
        if (!room) {
            return res.status(404).json({ 
                success: false,
                message: "Invalid invite code" 
            });
        }

        // Check if user is already a member
        if (room.members.some(member => member.user.toString() === userId.toString())) {
            return res.status(400).json({ 
                success: false,
                message: "Already a member of this room" 
            });
        }

        // Add member to room
        room.members.push({ user: userId, role: 'viewer' });
        await room.save();

        res.status(200).json({
            success: true,
            message: "Joined room successfully",
            room: {
                id: room._id,
                name: room.name,
                description: room.description,
                creator: room.creator,
                members: room.members,
                inviteCode: room.inviteCode,
                memberCount: room.memberCount,
                createdAt: room.createdAt,
                updatedAt: room.updatedAt
            }
        });
    } catch (error) {
        console.error('Join room by invite error:', error);
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

        const room = await roomModel.findById(roomId);
        if (!room) {
            return res.status(404).json({ 
                success: false,
                message: "Room not found" 
            });
        }

        // Check if user is a member
        if (!room.members.some(member => member.user.toString() === userId.toString())) {
            return res.status(400).json({ 
                success: false,
                message: "Not a member of this room" 
            });
        }

        // Remove the member and update memberCount
        const updatedRoom = await roomModel.findByIdAndUpdate(
            roomId,
            {
                $pull: {
                    members: { user: userId }
                },
                $inc: { memberCount: -1 }
            },
            { new: true }
        ).populate('members.user', 'name email');

        res.status(200).json({
            success: true,
            message: "Left room successfully",
            room: {
                id: updatedRoom._id,
                name: updatedRoom.name,
                description: updatedRoom.description,
                creator: updatedRoom.creator,
                members: updatedRoom.members,
                memberCount: updatedRoom.memberCount,
                createdAt: updatedRoom.createdAt,
                updatedAt: updatedRoom.updatedAt
            }
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
    leaveRoom,
    joinRoomByInvite
};
