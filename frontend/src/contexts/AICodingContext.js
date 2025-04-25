'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentProblem, submitSolution, getUserProgress, skipProblem } from '../axiosReq/aiCoding';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const AICodingContext = createContext();

export const AICodingProvider = ({ children }) => {
    const { user } = useAuth();
    const [currentProblem, setCurrentProblem] = useState(null);
    const [userLevel, setUserLevel] = useState(1);
    const [problemsSolved, setProblemsSolved] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [completedProblems, setCompletedProblems] = useState([]);

    // Fetch user progress when component mounts or user changes
    useEffect(() => {
        if (user?.token) {
            fetchUserProgress();
        }
    }, [user]);

    const fetchUserProgress = async () => {
        try {
            setIsLoading(true);
            const response = await getUserProgress();
            if (response.success) {
                const { level, problemsSolved, completedProblems, currentProblem } = response.progress;
                setUserLevel(level);
                setProblemsSolved(problemsSolved);
                setCompletedProblems(completedProblems || []);
                setCurrentProblem(currentProblem);
            }
        } catch (error) {
            console.error('Error fetching user progress:', error);
            toast.error('Failed to load your coding progress');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCurrentProblem = async () => {
        try {
            setIsLoading(true);
            const response = await getCurrentProblem();
            if (response.success) {
                setCurrentProblem(response.problem);
                setUserLevel(response.level);
                setProblemsSolved(response.problemsSolved);
            }
        } catch (error) {
            console.error('Error fetching problem:', error);
            toast.error('Failed to load coding problem');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitSolution = async (code, language) => {
        try {
            setIsLoading(true);
            setSubmissionResult(null);
            
            const response = await submitSolution(code, language);
            
            setSubmissionResult(response);
            
            if (response.passed) {
                toast.success('Solution passed all test cases!');
                setProblemsSolved(response.problemsSolved);
                
                if (response.leveledUp) {
                    setUserLevel(response.newLevel);
                    toast.success(`🎉 Congratulations! You've leveled up to Level ${response.newLevel}!`);
                }
                
                if (response.newProblem) {
                    setCurrentProblem(response.newProblem);
                }
                
                // Refresh user progress
                await fetchUserProgress();
            } else {
                toast.error('Solution failed some test cases');
            }
            
            return response;
        } catch (error) {
            console.error('Error submitting solution:', error);
            toast.error('Failed to submit solution');
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkipProblem = async () => {
        try {
            setIsLoading(true);
            const response = await skipProblem();
            if (response.success) {
                setCurrentProblem(response.problem);
                toast.success('Problem skipped. Here\'s a new challenge!');
            }
            return response;
        } catch (error) {
            console.error('Error skipping problem:', error);
            toast.error('Failed to skip problem');
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AICodingContext.Provider
            value={{
                currentProblem,
                userLevel,
                problemsSolved,
                isLoading,
                submissionResult,
                completedProblems,
                fetchCurrentProblem,
                submitSolution: handleSubmitSolution,
                skipProblem: handleSkipProblem,
                refreshProgress: fetchUserProgress
            }}
        >
            {children}
        </AICodingContext.Provider>
    );
};

export const useAICoding = () => useContext(AICodingContext);
