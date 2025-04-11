const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const verifyUserMiddleware = require('../middleware/verifyUser.middleware');

// Apply authentication middleware to all routes
router.use(verifyUserMiddleware);

// Question routes
router.post('/createQuestion', questionController.createQuestion);
router.get('/getQuestions', questionController.getQuestions);
router.get('/getQuestion/:questionId', questionController.getQuestion);
router.put('/updateQuestion/:questionId', questionController.updateQuestion);
router.delete('/deleteQuestion/:questionId', questionController.deleteQuestion);

module.exports = router; 