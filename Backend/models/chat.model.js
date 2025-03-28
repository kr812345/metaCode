const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    MessageID: { 
        type: mongoose.Schema.Types.ObjectId, 
        auto: true 
    },
    Timestamp: { 
        type: Date, 
        default: Date.now 
    },
    SenderID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    ReceiverID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    MsgContent: { 
        type: String, 
        required: true 
    }
});

const chatModel = mongoose.model('Chat', chatSchema);
module.exports = chatModel;