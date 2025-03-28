const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    UserID: { 
        type: mongoose.Schema.Types.ObjectId, 
        auto: true 
    },
    Name: { 
        type: String, 
        required: true 
    },
    Email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    Password: { 
        type: String, 
        required: true 
    },
    Role: { 
        type: String, 
        enum: ['user', 'admin'], 
        required: true 
    },
    AvatarID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Avatar' 
    }
});

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;