const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const appRoutes = require('./routes/v1routes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});

//Routes
app.use('/', appRoutes);

// Protected route example
app.get('/api/protected', verifyUserMiddleware, (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'You have access to protected route',
        user: req.user
    });
});

// Handle 404 - Route not found
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});


// Start Server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
