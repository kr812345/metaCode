const mongoose = require('mongoose');

const CodeSessionSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    code: {
        type: String,
        default: ''
    },
    language: {
        type: String,
        default: 'javascript'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30d' // Automatically delete after 30 days
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Index for efficient querying
CodeSessionSchema.index({ roomId: 1, createdAt: -1 });

const CodeSession = mongoose.model('CodeSession', CodeSessionSchema);

module.exports = CodeSession; 