const express = require('express');
const router = express.Router();
const { 
    getUserProblem, 
    submitSolution, 
    getUserProgress,
    skipProblem
} = require('../controllers/aiCoding.controller');
const verifyUserMiddleware = require('../middleware/userAuth');

// All routes require authentication
router.use(verifyUserMiddleware);

// Get current problem or generate a new one
router.get('/problem', getUserProblem);

// Submit a solution
router.post('/submit', submitSolution);

// Get user progress
router.get('/progress', getUserProgress);

// Skip current problem
router.post('/skip', skipProblem);

module.exports = router;
