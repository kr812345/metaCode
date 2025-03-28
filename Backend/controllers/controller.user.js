const { saltRounds } = require("../Helpers/helpers.constant");
const { createUserService, getUserDetailsByIdService, getUserDetailsByEmailService, updateUserDetailsByIdService } = require("../Services/services.user");
const bcrypt = require("bcrypt");
require('dotenv').config(); 

const loginUserController = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Fetch user by email
        const user = await getUserDetailsByEmailService(email.toLowerCase());
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        // Check if the password matches
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        // Send response with user info
        return res.status(200).json({ success: true, message: "Login successful", user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "An error occurred" });
    }
};

const createUserController = async (req, res) => {
    try {
        console.log("Request received:", req.body);

        // Validate request body
        if (!req.body.email || !req.body.password) {
            console.log("Invalid request body:", req.body);
            return res.status(400).json({ success: false, message: "Invalid request body" });
        }

        // Normalize email and check for existing user
        const email = req.body.email.toLowerCase();
        console.log("Validated email:", email);

        let userDetails = await getUserDetailsByEmailService(email);
        console.log("User details fetched:", userDetails);

        if (!userDetails) {
            console.log("User does not exist. Creating a new user.");

            let userType = req.body.userType || "care-giver";
            console.log("User type:", userType);

            // Encrypt the password
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
            console.log("Password hashed.");

            userDetails = await createUserService({
                email,
                password: hashedPassword,
                userType
            });
            console.log("New user created:", userDetails);

            return res.status(201).json({ success: true, message: "User created successfully", user: userDetails });
        } else {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
    } catch (err) {
        console.error("Error in createUserController:", err);
        return res.status(500).json({ success: false, message: "An error occurred" });
    }
};

const getUserDetailsController = async (req, res) => {
    try {
        const user = await getUserDetailsByIdService(req.user._id);
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        } else {
            return res.status(200).json({ success: true, message: "User details fetched successfully", user });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "An error occurred" });
    }
};

const changePasswordController = async (req, res) => {
    try {
        const { newPassword } = req.body; 
        const userId = req.user._id; 

        // Validate new password
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        const isUpdated = await updateUserDetailsByIdService(userId, { password: hashedPassword });

        if (!isUpdated) {
            return res.status(500).json({ success: false, message: "Password update failed" });
        }

        // Respond with success
        return res.status(200).json({ success: true, message: "Your password has been changed successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "An error occurred" });
    }
};

module.exports = {
    createUserController,
    getUserDetailsController,
    loginUserController,
    changePasswordController
};