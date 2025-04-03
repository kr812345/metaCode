const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Room name is required'],
        trim: true,
        minlength: [3, 'Room name must be at least 3 characters long'],
        maxlength: [50, 'Room name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator ID is required']
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        role: {
            type: String,
            enum: ['owner', 'editor', 'viewer'],
            default: 'viewer'
        }
    }],
    code: {
        type: String,
        default: '',
        maxlength: [100000, 'Code content cannot exceed 100,000 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
roomSchema.index({ name: 'text', description: 'text' });
roomSchema.index({ creator: 1 });
roomSchema.index({ 'members.user': 1 });

// Virtual for member count
roomSchema.virtual('memberCount').get(function() {
    return this.members.length;
});

// Method to add a member to the room
roomSchema.methods.addMember = async function(userId, role = 'viewer') {
    if (!this.members.some(member => member.user.toString() === userId.toString())) {
        this.members.push({
            user: userId,
            role: role
        });
        return await this.save();
    }
    return this;
};

// Method to remove a member from the room
roomSchema.methods.removeMember = async function(userId) {
    this.members = this.members.filter(member => member.user.toString() !== userId.toString());
    return await this.save();
};

// Method to check if a user is a member
roomSchema.methods.isMember = function(userId) {
    return this.members.some(member => member.user.toString() === userId.toString());
};

// Method to get member role
roomSchema.methods.getMemberRole = function(userId) {
    const member = this.members.find(member => member.user.toString() === userId.toString());
    return member ? member.role : null;
};

const Room = mongoose.model('Room', roomSchema);

module.exports = Room; 