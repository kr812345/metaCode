const { sendResponse } = require("../Helpers/helpers.commonFunc");
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file

const verifyUserMiddleware = (req, res, next) => {
    const token = req.headers["x-access-token"];
    if (!token) {
        sendResponse(res, null, 401, false, "Token not found");
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            sendResponse(res, null, 401, false, "Unauthorized Token");
            return;
        }

        req.user = decoded.user;
        if (!decoded.isVerified) {
            sendResponse(res, null, 401, false, "Invalid Token");
            return;
        }
        console.log('auth check done')
        next();
    } catch (err) {
        sendResponse(res, null, 401, false, "Unauthorized Token");
        return;
    }
};

module.exports = {
    verifyUserMiddleware
};
