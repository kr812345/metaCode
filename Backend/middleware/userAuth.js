const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file

const verifyUserMiddleware = (req, res, next) => {
    console.log('\n=== Token Verification Debug ===');
    console.log('Request URL:', req.url);
    console.log('Request Method:', req.method);
    console.log('All Headers:', JSON.stringify(req.headers, null, 2));
    
    const authHeader = req.headers['authorization'];
    console.log('\nAuthorization Header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No Bearer token found in Authorization header');
        return res.status(401).json({ 
            success: false,
            message: "No access token provided" 
        });
    }

    const token = authHeader.split(' ')[1];
    console.log('\nExtracted Token:', token);
    
    try {
        console.log('\nJWT_SECRET_KEY:', process.env.JWT_SECRET_KEY);
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log('Successfully decoded token:', JSON.stringify(decoded, null, 2));

        if (!decoded) {
            console.log('Token decoded but empty');
            return res.status(401).json({ 
                success: false,
                message: "Invalid token" 
            });
        }

        // Store decoded user info in req.user
        req.user = { 
            user: decoded.user,
            isVerified: decoded.isVerified 
        };
        
        if (!decoded.isVerified) {
            console.log('Token decoded but user not verified');
            return res.status(401).json({ 
                success: false,
                message: "Invalid token" 
            });
        }
        console.log(req.user);
        console.log('\nAuthentication successful, proceeding to next middleware');
        next();
    } catch (err) {
        console.error('\nToken verification error:', err.message);
        console.error('Error stack:', err.stack);
        return res.status(401).json({ 
            success: false,
            message: "Invalid token" 
        });
    }
};

module.exports = {
    verifyUserMiddleware
};