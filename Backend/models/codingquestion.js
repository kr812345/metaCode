const codingQuestionSchema = new mongoose.Schema({
    Question_ID: { 
        type: mongoose.Schema.Types.ObjectId, 
        auto: true 
    },
    Title: { 
        type: String, 
        required: true 
    },
    Description: { 
        type: String, 
        required: true 
    },
    DifficultyLevel: { 
        type: String, 
        enum: ['Easy', 'Medium', 'Hard'], 
        required: true 
    },
    Contest_ID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Contest', 
        required: true 
    }
});

const codingQuestionModel = mongoose.model('CodingQuestion', codingQuestionSchema);
module.exports = codingQuestionModel;