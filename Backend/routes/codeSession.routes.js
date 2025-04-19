// const express = require('express');
// const router = express.Router();
// const { 
//     createCodeSession, 
//     getCodeSession, 
//     updateCodeSession, 
//     deleteCodeSession,
//     saveCode,
//     getCodeHistory,
//     executeCode,
//     shareCodeSession
// } = require('../controllers/codeSession.controller');
// const { authenticateUser } = require('../middleware/userAuth');
// const { validateCodeSession } = require('../middleware/validation');

// // Protected routes
// router.post('/', authenticateUser, validateCodeSession, createCodeSession);
// router.get('/:sessionId', authenticateUser, getCodeSession);
// router.put('/:sessionId', authenticateUser, validateCodeSession, updateCodeSession);
// router.delete('/:sessionId', authenticateUser, deleteCodeSession);
// router.post('/:sessionId/save', authenticateUser, saveCode);
// router.get('/:sessionId/history', authenticateUser, getCodeHistory);
// router.post('/:sessionId/execute', authenticateUser, executeCode);
// router.post('/:sessionId/share', authenticateUser, shareCodeSession);

// module.exports = router; 