const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    AdminID: { 
        type: mongoose.Schema.Types.ObjectId, 
        auto: true 
    },
    UserID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
});

const adminModel = mongoose.model('Admin', adminSchema);
module.exports = adminModel;