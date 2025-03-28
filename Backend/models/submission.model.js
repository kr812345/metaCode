const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    Submission_ID: { 
        type: mongoose.Schema.Types.ObjectId, 
        auto: true 
    },
    Score: { 
        type: Number, 
        required: true 
    },
    Timestamp: { 
        type: Date, 
        default: Date.now 
    },
    Status: { 
        type: String, 
        enum: ['Accepted', 'Rejected', 'Pending'], 
        required: true 
    },
    Language: { 
        type: String, 
        required: true 
    },
    Code: { 
        type: String, 
        required: true 
    },
    QuestionID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'CodingQuestion', 
        required: true 
    },
    User_ID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
});

const submissionModel = mongoose.model('Submission', submissionSchema);
module.exports = submissionModel;