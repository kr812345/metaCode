const express = require('express');
const v1Router = express.Router();

const userRoutes = require('./routes.user');



v1Router.use('/api/user', userRoutes);



// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API v1 is running' });
});

module.exports = router;
