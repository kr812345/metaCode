const mongoose = require('mongoose');

const avatarSchema = new mongoose.Schema({
    AvatarID: { 
        type: mongoose.Schema.Types.ObjectId, 
        auto: true 
    },
    AvatarName: { 
        type: String, 
        required: true 
    },
    Avatar_img: { 
        type: String, 
        required: true 
    }
});

const avatarModel = mongoose.model('Avatar', avatarSchema);
module.exports = avatarModel;