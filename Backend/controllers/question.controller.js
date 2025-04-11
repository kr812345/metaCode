const Question = require('../models/question.model');
const User = require('../models/user.model');

// Create a new question
exports.createQuestion = async (req, res) => {
    try {
        const { title, description, difficulty, category, testCases } = req.body;
        const creator = req.user.id;

        // Validate required fields
        if (!title || !description || !difficulty || !category || !testCases) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Create new question
        const question = new Question({
            title,
            description,
            difficulty,
            category,
            testCases,
            creator
        });

        await question.save();

        res.status(201).json({
            success: true,
            message: "Question created successfully",
            question
        });
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({
            success: false,
            message: "Error creating question",
            error: error.message
        });
    }
};

// Get all questions
exports.getQuestions = async (req, res) => {
    try {
        const questions = await Question.find()
            .populate('creator', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            questions
        });
    } catch (error) {
        console.error('Error getting questions:', error);
        res.status(500).json({
            success: false,
            message: "Error getting questions",
            error: error.message
        });
    }
};

// Get question by ID
exports.getQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.questionId)
            .populate('creator', 'name email');

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        res.status(200).json({
            success: true,
            question
        });
    } catch (error) {
        console.error('Error getting question:', error);
        res.status(500).json({
            success: false,
            message: "Error getting question",
            error: error.message
        });
    }
};

// Update question
exports.updateQuestion = async (req, res) => {
    try {
        const { title, description, difficulty, category, testCases } = req.body;
        const questionId = req.params.questionId;
        const userId = req.user.id;

        // Find the question
        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        // Check if user is the creator
        if (question.creator.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this question"
            });
        }

        // Update question
        const updatedQuestion = await Question.findByIdAndUpdate(
            questionId,
            {
                title,
                description,
                difficulty,
                category,
                testCases
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Question updated successfully",
            question: updatedQuestion
        });
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({
            success: false,
            message: "Error updating question",
            error: error.message
        });
    }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
    try {
        const questionId = req.params.questionId;
        const userId = req.user.id;

        // Find the question
        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        // Check if user is the creator
        if (question.creator.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this question"
            });
        }

        await Question.findByIdAndDelete(questionId);

        res.status(200).json({
            success: true,
            message: "Question deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({
            success: false,
            message: "Error deleting question",
            error: error.message
        });
    }
}; 