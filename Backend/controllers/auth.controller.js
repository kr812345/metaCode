const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * User registration controller
 */
const register = async (req, res) => {
    try {
        console.log('\n=== Registration Debug ===');
        console.log('Request body:', req.body);
        
        const { name, email, password } = req.body;
        console.log('Extracted fields:', { name, email, password: '***' });

        // Validate input
        if (!name || !email || !password) {
            console.log('Missing required fields');
            return res.status(400).json({ 
                success: false,
                message: "Please provide all required fields" 
            });
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase();
        console.log('Normalized email:', normalizedEmail);

        // Check if user already exists
        console.log('Checking for existing user...');
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            console.log('User already exists:', existingUser.email);
            return res.status(400).json({ 
                success: false,
                message: "User already exists" 
            });
        }

        // Hash password
        console.log('Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('Password hashed successfully');

        // Create new user
        console.log('Creating new user...');
        const user = new User({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: 'user'
        });

        console.log('Saving user to database...');
        await user.save();
        console.log('User saved successfully');

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
        console.log('Token created successfully');

        console.log('Registration successful, sending response');
        res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('\n=== Registration Error ===');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false,
            message: "Error registering user",
            error: error.message 
        });
    }
};

/**
 * User login controller
 */
const login = async (req, res) => {
    try {
        console.log('Login attempt:', req.body);
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ 
                success: false,
                message: "Please provide email and password" 
            });
        }

        // Find user
        console.log('Looking for user with email:', email);
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log('User not found with email:', email);
            return res.status(400).json({ 
                success: false,
                message: "Invalid credentials" 
            });
        }

        // Verify password
        console.log('Verifying password...');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(400).json({ 
                success: false,
                message: "Invalid credentials" 
            });
        }

        // Create JWT token
        console.log('Creating JWT token...');
        console.log('Using JWT_SECRET_KEY:', process.env.JWT_SECRET_KEY);
        
        const tokenPayload = { 
            user: user._id,
            isVerified: true
        };
        console.log('Token payload:', tokenPayload);
        
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' }
        );
        console.log('Generated token:', token);

        // Verify the token can be decoded
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            console.log('Token verification test successful:', decoded);
        } catch (verifyError) {
            console.error('Token verification test failed:', verifyError);
        }

        console.log('Login successful, sending response.');
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: "Error logging in" 
        });
    }
};

/**
 * Get user details controller
 */
const getUserDetails = async (req, res) => {
    try {
        console.log('User object from middleware:', req.user);
        const userId = req.user.user;
        
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }
        
        return res.status(200).json({
            success: true,
            message: "User details fetched successfully", 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ 
            success: false,
            message: "Error retrieving user details" 
        });
    }
};

module.exports = {
    register,
    login,
    getUserDetails
};