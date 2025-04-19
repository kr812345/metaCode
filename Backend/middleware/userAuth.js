const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyUserMiddleware = (req, res, next) => {
    let token;
    
    // Try getting token from cookie first
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    // Fall back to Bearer token in Authorization header
    else {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: "No access token provided" 
            });
        }
        token = authHeader.split(' ')[1];
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if (!decoded || !decoded.user) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid token" 
            });
        }

        req.user = { 
            user: decoded.user,
            isVerified: decoded.isVerified 
        };
        
        if (!decoded.isVerified) {
            return res.status(401).json({ 
                success: false,
                message: "User not verified" 
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({ 
            success: false,
            message: "Invalid token" 
        });
    }
};

module.exports = verifyUserMiddleware;