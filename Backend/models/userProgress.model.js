const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    level: {
        type: Number,
        default: 1
    },
    problemsSolved: {
        type: Number,
        default: 0
    },
    completedProblems: [{
        problemId: String,
        code: String,
        language: String,
        solvedAt: {
            type: Date,
            default: Date.now
        }
    }],
    currentProblem: {
        problemId: String,
        statement: String,
        description: String,
        difficulty: String,
        testCases: [{
            input: String,
            output: String
        }],
        generatedAt: Date
    }
}, {
    timestamps: true
});

// Method to level up user when they solve 5 problems
userProgressSchema.methods.checkAndLevelUp = function() {
    if (this.problemsSolved >= 5) {
        this.level += 1;
        this.problemsSolved = 0;
        return true;
    }
    return false;
};

module.exports = mongoose.model('UserProgress', userProgressSchema);
