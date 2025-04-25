const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = AIzaSyDvQhGRXoyXhIH5i66QLCf0YwUXaVNFRNE;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Simple test endpoint to verify Gemini API is working
 */
const testGeminiAPI = async (req, res) => {
    try {
        console.log('Testing Gemini API with key:', GEMINI_API_KEY ? 'Key exists' : 'No key found');
        
        if (!GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: 'Gemini API key is not configured'
            });
        }
        
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: "Generate a simple 'Hello World' program in JavaScript."
                            }
                        ]
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        // Extract the generated text from the response
        const generatedText = response.data.candidates[0].content.parts[0].text;
        
        res.status(200).json({
            success: true,
            message: 'Gemini API test successful',
            generatedText
        });
    } catch (error) {
        console.error('Gemini API test error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Error testing Gemini API',
            error: error.response?.data || error.message
        });
    }
};

module.exports = {
    testGeminiAPI
};
