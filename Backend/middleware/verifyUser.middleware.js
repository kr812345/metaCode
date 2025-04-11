const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const verifyUserMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('x-access-token');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        const user = await User.findById(decoded.user);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};

module.exports = verifyUserMiddleware; 