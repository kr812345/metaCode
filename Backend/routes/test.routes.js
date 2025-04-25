const express = require('express');
const router = express.Router();
const { testGeminiAPI } = require('../controllers/test.controller');

// Public test route - no authentication required
router.get('/gemini', testGeminiAPI);
// In test.routes.js
router.get('/gemini-test', testGeminiAPI);

module.exports = router;
