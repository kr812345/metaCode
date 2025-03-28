const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    ContestId: { 
        type: mongoose.Schema.Types.ObjectId, 
        auto: true
    },
    ContestName: { 
        type: String, 
        required: true 
    },
    StartTime: { 
        type: Date, 
        required: true 
    },
    EndTime: { 
        type: Date, 
        required: true
    },
    UserID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    }
});

const contestModel = mongoose.model('Contest', contestSchema);
module.exports = contestModel;