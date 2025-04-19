const express = require('express');
const router = express.Router();
const { register, login, getUserDetails } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { authenticateUser } = require('../middleware/userAuth');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);


module.exports = router; 