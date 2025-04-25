const axios = require('axios');
const UserProgress = require('../models/userProgress.model');
const User = require('../models/user.model');
require('dotenv').config();

const GEMINI_API_KEY = AIzaSyDvQhGRXoyXhIH5i66QLCf0YwUXaVNFRNE;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Generate a coding problem using Gemini AI
 */
const generateProblem = async (level) => {
    try {
        const difficulty = level <= 2 ? 'easy' : level <= 5 ? 'medium' : 'hard';
        
        const prompt = `Generate a coding problem with the following:
        1. A title for the problem
        2. A detailed description of the problem
        3. 3 test cases with input and expected output
        4. Difficulty level: ${difficulty}
        
        Format the response as a JSON object with the following structure:
        {
            "title": "Problem title",
            "description": "Detailed problem description",
            "difficulty": "${difficulty}",
            "testCases": [
                {"input": "test input 1", "output": "expected output 1"},
                {"input": "test input 2", "output": "expected output 2"},
                {"input": "test input 3", "output": "expected output 3"}
            ]
        }`;

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
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
        
        // Parse the JSON from the generated text
        // Find the JSON object in the text (it might be surrounded by markdown code blocks)
        const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                         generatedText.match(/{[\s\S]*}/);
        
        let problemData;
        if (jsonMatch) {
            const jsonString = jsonMatch[1] || jsonMatch[0];
            problemData = JSON.parse(jsonString);
        } else {
            throw new Error('Failed to parse JSON from AI response');
        }

        return {
            ...problemData,
            problemId: `problem-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        };
    } catch (error) {
        console.error('Error generating problem with AI:', error);
        throw error;
    }
};

/**
 * Get or generate a new problem for the user
 */
const getUserProblem = async (req, res) => {
    try {
        const userId = req.user.user;
        
        // Find or create user progress
        let userProgress = await UserProgress.findOne({ userId });
        
        if (!userProgress) {
            userProgress = new UserProgress({ userId });
        }
        
        // If user doesn't have a current problem, generate one
        if (!userProgress.currentProblem || !userProgress.currentProblem.problemId) {
            const problem = await generateProblem(userProgress.level);
            userProgress.currentProblem = {
                ...problem,
                generatedAt: new Date()
            };
            await userProgress.save();
        }
        
        res.status(200).json({
            success: true,
            problem: userProgress.currentProblem,
            level: userProgress.level,
            problemsSolved: userProgress.problemsSolved
        });
    } catch (error) {
        console.error('Error getting user problem:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting problem',
            error: error.message
        });
    }
};

/**
 * Submit a solution for the current problem
 */
const submitSolution = async (req, res) => {
    try {
        const userId = req.user.user;
        const { code, language } = req.body;
        
        if (!code || !language) {
            return res.status(400).json({
                success: false,
                message: 'Code and language are required'
            });
        }
        
        // Get user progress
        const userProgress = await UserProgress.findOne({ userId });
        if (!userProgress || !userProgress.currentProblem) {
            return res.status(400).json({
                success: false,
                message: 'No active problem found'
            });
        }
        
        // Evaluate the solution using Gemini AI
        const { currentProblem } = userProgress;
        const testCases = currentProblem.testCases;
        
        // Prepare prompt for code evaluation
        const evaluationPrompt = `
        Evaluate the following ${language} code against the test cases:
        
        Problem: ${currentProblem.title}
        Description: ${currentProblem.description}
        
        Code:
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Test Cases:
        ${testCases.map((tc, i) => `
        Test Case ${i+1}:
        Input: ${tc.input}
        Expected Output: ${tc.output}
        `).join('\n')}
        
        For each test case, determine if the code produces the expected output.
        Return your evaluation as a JSON object with the following structure:
        {
            "passed": true/false,
            "results": [
                {"testCase": 1, "passed": true/false, "actual": "actual output", "expected": "expected output"},
                {"testCase": 2, "passed": true/false, "actual": "actual output", "expected": "expected output"},
                {"testCase": 3, "passed": true/false, "actual": "actual output", "expected": "expected output"}
            ],
            "feedback": "Explanation of why the solution passed or failed"
        }`;
        
        const evaluationResponse = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: evaluationPrompt
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
        
        // Extract the evaluation result
        const evaluationText = evaluationResponse.data.candidates[0].content.parts[0].text;
        
        // Parse the JSON from the evaluation text
        const jsonMatch = evaluationText.match(/```json\n([\s\S]*?)\n```/) || 
                         evaluationText.match(/{[\s\S]*}/);
        
        let evaluation;
        if (jsonMatch) {
            const jsonString = jsonMatch[1] || jsonMatch[0];
            evaluation = JSON.parse(jsonString);
        } else {
            throw new Error('Failed to parse JSON from AI evaluation');
        }
        
        // If all tests passed, update user progress
        if (evaluation.passed) {
            // Add to completed problems
            userProgress.completedProblems.push({
                problemId: currentProblem.problemId,
                code,
                language,
                solvedAt: new Date()
            });
            
            // Increment problems solved
            userProgress.problemsSolved += 1;
            
            // Check if user should level up
            const didLevelUp = userProgress.checkAndLevelUp();
            
            // Generate a new problem
            const newProblem = await generateProblem(userProgress.level);
            userProgress.currentProblem = {
                ...newProblem,
                generatedAt: new Date()
            };
            
            await userProgress.save();
            
            return res.status(200).json({
                success: true,
                passed: true,
                evaluation,
                leveledUp: didLevelUp,
                newLevel: userProgress.level,
                problemsSolved: userProgress.problemsSolved,
                newProblem: didLevelUp || userProgress.problemsSolved === 0 ? userProgress.currentProblem : null
            });
        } else {
            // If solution failed, return evaluation without updating progress
            return res.status(200).json({
                success: true,
                passed: false,
                evaluation
            });
        }
    } catch (error) {
        console.error('Error submitting solution:', error);
        res.status(500).json({
            success: false,
            message: 'Error evaluating solution',
            error: error.message
        });
    }
};

/**
 * Get user progress and stats
 */
const getUserProgress = async (req, res) => {
    try {
        const userId = req.user.user;
        
        const userProgress = await UserProgress.findOne({ userId });
        if (!userProgress) {
            return res.status(200).json({
                success: true,
                progress: {
                    level: 1,
                    problemsSolved: 0,
                    completedProblems: []
                }
            });
        }
        
        res.status(200).json({
            success: true,
            progress: {
                level: userProgress.level,
                problemsSolved: userProgress.problemsSolved,
                completedProblems: userProgress.completedProblems,
                currentProblem: userProgress.currentProblem
            }
        });
    } catch (error) {
        console.error('Error getting user progress:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting user progress',
            error: error.message
        });
    }
};

/**
 * Skip current problem and get a new one
 */
const skipProblem = async (req, res) => {
    try {
        const userId = req.user.user;
        
        let userProgress = await UserProgress.findOne({ userId });
        if (!userProgress) {
            userProgress = new UserProgress({ userId });
        }
        
        // Generate a new problem
        const problem = await generateProblem(userProgress.level);
        userProgress.currentProblem = {
            ...problem,
            generatedAt: new Date()
        };
        
        await userProgress.save();
        
        res.status(200).json({
            success: true,
            problem: userProgress.currentProblem
        });
    } catch (error) {
        console.error('Error skipping problem:', error);
        res.status(500).json({
            success: false,
            message: 'Error skipping problem',
            error: error.message
        });
    }
};

module.exports = {
    getUserProblem,
    submitSolution,
    getUserProgress,
    skipProblem
};
