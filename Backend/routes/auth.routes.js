const express = require('express');
const router = express.Router();
const { register, login, getUserDetails } = require('../controllers/auth.controller');
const { verifyUserMiddleware } = require('../middleware/userAuth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/user', verifyUserMiddleware, getUserDetails);

module.exports = router;