const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['owner', 'viewer', 'editor'],
        default: 'viewer'
    }
}, { _id: false });

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    inviteCode: {
        type: String,
        unique: true,
        default: () => Math.random().toString(36).substring(2, 10)
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['owner', 'viewer', 'editor'],
            default: 'viewer'
        }
    }],
    isPrivate: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        trim: true
    },
    maxParticipants: {
        type: Number,
        default: 10
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'deleted'],
        default: 'active'
    },
    codeSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CodeSession'
    }
}, {
    timestamps: true
});

// Index for faster queries
roomSchema.index({ name: 'text', description: 'text' });
roomSchema.index({ creator: 1 });
roomSchema.index({ status: 1 });

 
module.exports = mongoose.model('Room', roomSchema);