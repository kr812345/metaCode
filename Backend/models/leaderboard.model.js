const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    Leaderboard_ID: { 
        type: mongoose.Schema.Types.ObjectId, 
        auto: true 
    },
    Contest_ID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Contest', 
        required: true 
    },
    User_ID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    Score: { 
        type: Number, 
        required: true 
    },
    Rank: { 
        type: Number, 
        required: true 
    }
});

const leaderboardModel = mongoose.model('Leaderboard', leaderboardSchema);
module.exports = leaderboardModel;