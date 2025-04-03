const mongoose = require('mongoose');

const dbConnect = () => {   
    // MongoDB Connection
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    
    const connection = mongoose.connection;
    connection.once('open', () => {
        console.log("MongoDB database connection established successfully");
    });
}

module.exports = dbConnect;