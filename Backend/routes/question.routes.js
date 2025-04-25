const express = require('express');
const router = express.Router();
const { 
    getQuestionsByLevel, 
    submitSolution, 
    getUserProgress 
} = require('../controllers/question.controller');
const verifyUserMiddleware = require('../middleware/userAuth');

// Protected routes
router.get('/level/:level', verifyUserMiddleware, getQuestionsByLevel);
router.post('/submit/:questionId', verifyUserMiddleware, submitSolution);
router.get('/progress', verifyUserMiddleware, getUserProgress);
// Add this route
router.get('/leaderboard', verifyUserMiddleware, getLeaderboard);

module.exports = router;
