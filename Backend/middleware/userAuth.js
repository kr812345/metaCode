const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file

const verifyUserMiddleware = (req, res, next) => {
    const token = req.headers["x-access-token"] || req.headers["authorization"]?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: "Token not found" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({ success: false, message: "Unauthorized Token" });
        }

        // Store decoded user info in req.user
        req.user = { 
            userId: decoded.user, 
            isVerified: decoded.isVerified 
        };
        
        if (!decoded.isVerified) {
            return res.status(401).json({ success: false, message: "Invalid Token" });
        }
        
        console.log('Authentication Check Done');
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Unauthorized Token" });
    }
};

module.exports = {
    verifyUserMiddleware
};