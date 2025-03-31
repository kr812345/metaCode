const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * User registration controller
 */
const register = async (req, res) => {
    try {
        console.log('Registration request received:', req.body);
        const { Name, Email, Password } = req.body;

        // Validate input
        if (!Name || !Email || !Password) {
            console.log('Missing required fields');
            return res.status(400).json({ Msg: "Please provide all required fields" });
        }

        // Check if user already exists
        console.log('Checking if user exists with email:', Email);
        const existingUser = await User.findOne({ Email });
        if (existingUser) {
            console.log('User already exists:', Email);
            return res.status(400).json({ Msg: "User already exists" });
        }

        // Hash password
        console.log('Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(Password, salt);

        // Create new user
        console.log('Creating new user object...');
        const newUser = new User({
            Name,
            Email,
            Password: hashedPassword,
            Role: 'user' // Default role
        });

        console.log('Attempting to save user to database...');
        try {
            await newUser.save();
            console.log('User saved successfully');
        } catch (saveError) {
            console.error('Error saving user to database:', saveError);
            if (saveError.code === 11000) {
                return res.status(400).json({ Msg: "User already exists" });
            }
            throw saveError;
        }

        // Create JWT token
        console.log('Creating JWT token...');
        const token = jwt.sign(
            { 
                user: newUser._id,
                isVerified: true
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' }
        );

        console.log('Registration successful, sending response...');
        res.status(201).json({
            Msg: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                name: newUser.Name,
                email: newUser.Email,
                role: newUser.Role
            }
        });
    } catch (error) {
        console.error('Registration error details:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            Msg: "Error registering user",
            error: error.message 
        });
    }
};

/**
 * User login controller
 */
const login = async (req, res) => {
    try {
        console.log('Login attempt received:', req.body);
        const { Email, Password } = req.body;

        // Validate input
        if (!Email || !Password) {
            console.log('Missing email or password');
            return res.status(400).json({ Msg: "Please provide email and password" });
        }

        // Find user
        console.log('Looking for user with email:', Email);
        const user = await User.findOne({ Email });
        if (!user) {
            console.log('User not found with email:', Email);
            return res.status(400).json({ Msg: "Invalid credentials" });
        }

        // Verify password
        console.log('Verifying password...');
        const isMatch = await bcrypt.compare(Password, user.Password);
        if (!isMatch) {
            console.log('Password mismatch for user:', Email);
            return res.status(400).json({ Msg: "Invalid credentials" });
        }

        // Create JWT token
        console.log('Creating JWT token...');
        const token = jwt.sign(
            { 
                user: user._id,
                isVerified: true
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' }
        );

        console.log('Login successful, sending response.');
        res.status(200).json({
            Msg: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.Name,
                email: user.Email,
                role: user.Role
            }
        });
    } catch (error) {
        console.error('Login error details:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            Msg: "Error logging in",
            error: error.message 
        });
    }
};

/**
 * Get user details controller
 */
const getUserDetails = async (req, res) => {
    try {
        // Get userId from req.user set by middleware
        const userId = req.user.userId;
        
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        return res.status(200).json({
            success: true,
            message: "User details fetched successfully", 
            user
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ success: false, message: "Server error retrieving user details" });
    }
};

module.exports = {
    register,
    login,
    getUserDetails
};