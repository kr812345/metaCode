// const express = require('express');
// const router = express.Router();
// const { 
//     getUserProfile, 
//     updateUserProfile, 
//     updateUserPassword,
//     deleteUserAccount,
//     getUserRooms,
//     getUserActivity
// } = require('../controllers/user.controller');
// const { authenticateUser } = require('../middleware/userAuth');
// const { validateUserUpdate, validatePasswordUpdate } = require('../middleware/validation');

// // Protected routes
// router.get('/profile', authenticateUser, getUserProfile);
// router.put('/profile', authenticateUser, validateUserUpdate, updateUserProfile);
// router.put('/password', authenticateUser, validatePasswordUpdate, updateUserPassword);
// router.delete('/account', authenticateUser, deleteUserAccount);
// router.get('/rooms', authenticateUser, getUserRooms);
// router.get('/activity', authenticateUser, getUserActivity);

// module.exports = router; 