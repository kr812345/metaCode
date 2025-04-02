const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
const result = dotenv.config();
if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);
}

// Debug: Check if environment variables are loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
console.log('PORT:', process.env.PORT || 'Using default (3000)');

const app = express();

app.use(cors());
app.use(express.json()); 

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
console.log('MONGODB_URI:', MONGODB_URI ? 'Found' : 'Not found');

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('MongoDB Connected');
        
        // Drop and recreate the users collection
        try {
            await mongoose.connection.collection('users').drop();
            console.log('Users collection dropped successfully');
        } catch (err) {
            if (err.code === 26) {
                console.log('Users collection does not exist, creating new one');
            } else {
                console.error('Error dropping users collection:', err);
            }
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Routes
const authRoutes = require('./routes/auth.routes');
const roomRoutes = require('./routes/room.routes');

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

app.get('/', (req, res) => {
    res.send('API is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));