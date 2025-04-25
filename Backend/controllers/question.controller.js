const fs = require('fs').promises;
const path = require('path');
const User = require('../models/user.model');

// Path to questions JSON file
const questionsFilePath = path.join(__dirname, '../data/questions.json');

// Get questions for a specific level
const getQuestionsByLevel = async (req, res) => {
    try {
        const { level } = req.params;
        const userId = req.user.user;

        // Read questions from JSON file
        const questionsData = await fs.readFile(questionsFilePath, 'utf8');
        const questions = JSON.parse(questionsData);

        // Filter questions by level
        const levelQuestions = questions.filter(q => q.level === parseInt(level));
        
        // Remove solutions from questions before sending to client
        const sanitizedQuestions = levelQuestions.map(q => {
            const { solution, ...questionWithoutSolution } = q;
            return questionWithoutSolution;
        });

        res.status(200).json({
            success: true,
            message: "Questions fetched successfully",
            questions: sanitizedQuestions
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching questions",
            error: error.message
        });
    }
};

// Submit a solution for a question
const submitSolution = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { code } = req.body;
        const userId = req.user.user;

        // Read questions from JSON file
        const questionsData = await fs.readFile(questionsFilePath, 'utf8');
        const questions = JSON.parse(questionsData);

        // Find the question
        const question = questions.find(q => q.id === parseInt(questionId));
        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        // Execute the code against test cases
        const results = await executeCode(code, question);
        
        // Check if all test cases passed
        const allPassed = results.every(result => result.passed);
        
        // If all test cases passed, update user's progress
        if (allPassed) {
            await updateUserProgress(userId, question.level);
        }

        res.status(200).json({
            success: true,
            message: allPassed ? "All test cases passed!" : "Some test cases failed",
            results,
            allPassed
        });
    } catch (error) {
        console.error('Error submitting solution:', error);
        res.status(500).json({
            success: false,
            message: "Error submitting solution",
            error: error.message
        });
    }
};

// Execute code against test cases
const executeCode = async (code, question) => {
    const results = [];
    
    try {
        const userFunction = new Function(`
            ${code}
            return ${question.functionName};
        `)();

        for (const testCase of question.testCases) {
            try {
                const output = userFunction(...testCase.input);
                const passed = JSON.stringify(output) === JSON.stringify(testCase.output);
                
                results.push({
                    input: testCase.input,
                    expectedOutput: testCase.output,
                    actualOutput: output,
                    passed
                });
            } catch (error) {
                results.push({
                    input: testCase.input,
                    expectedOutput: testCase.output,
                    error: error.message,
                    passed: false
                });
            }
        }
    } catch (error) {
        results.push({
            error: `Syntax error: ${error.message}`,
            passed: false
        });
    }
    
    return results;
};

// Update user's progress
const updateUserProgress = async (userId, questionLevel) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        if (!user.codingProgress) {
            user.codingProgress = {
                level: 1,
                solvedQuestions: [],
                questionsToLevelUp: 5
            };
        }

        if (!user.codingProgress.solvedQuestions.includes(questionLevel)) {
            user.codingProgress.solvedQuestions.push(questionLevel);
            
            if (user.codingProgress.solvedQuestions.length >= user.codingProgress.questionsToLevelUp) {
                user.codingProgress.level += 1;
                user.codingProgress.solvedQuestions = [];
                user.codingProgress.questionsToLevelUp = 5;
            }
            
            await user.save();
        }
    } catch (error) {
        console.error('Error updating user progress:', error);
    }
};

// Get user's coding progress
const getUserProgress = async (req, res) => {
    try {
        const userId = req.user.user;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.codingProgress) {
            user.codingProgress = {
                level: 1,
                solvedQuestions: [],
                questionsToLevelUp: 5
            };
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: "User progress fetched successfully",
            progress: user.codingProgress
        });
    } catch (error) {
        console.error('Error fetching user progress:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching user progress",
            error: error.message
        });
    }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const users = await User.find({})
            .select('name codingProgress')
            .sort({ 'codingProgress.level': -1 })
            .limit(10);
        
        const leaderboard = users.map(user => ({
            name: user.name,
            level: user.codingProgress?.level || 1,
            solvedCount: user.codingProgress 
                ? (user.codingProgress.level - 1) * 5 + user.codingProgress.solvedQuestions.length
                : 0
        }));
        
        res.status(200).json({
            success: true,
            message: "Leaderboard fetched successfully",
            leaderboard
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching leaderboard",
            error: error.message
        });
    }
};

module.exports = {
    getQuestionsByLevel,
    submitSolution,
    getUserProgress,
    getLeaderboard
};
