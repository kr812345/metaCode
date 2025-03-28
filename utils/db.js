const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config(); 

const URI = process.env.MONGO_URI || "mongodb://localhost:27017/metacode";

const connectDB = async () => {
    try {
        await mongoose.connect(URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
        console.log(" Connection successful to database!!");
    } catch (error) {
        console.error(" Database connection failed:", error.message);
        process.exit(1); 
    }
};

module.exports = connectDB;