'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAICoding } from '@/contexts/AICodingContext';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { dracula } from '@uiw/codemirror-theme-dracula';
import UserProgressBar from '@/components/UserProgressBar';
import AIProblemDisplay from '@/components/AIProblemDisplay';
import SubmissionResults from '@/components/SubmissionResults';
import toast from 'react-hot-toast';

const AIChallengesPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { 
        currentProblem, 
        isLoading, 
        submissionResult, 
        fetchCurrentProblem, 
        submitSolution,
        userLevel,
        problemsSolved
    } = useAICoding();
    
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        if (!user?.token) {
            router.push('/login');
            return;
        }
        
        if (!currentProblem) {
            fetchCurrentProblem();
        }
    }, [user, router, currentProblem, fetchCurrentProblem]);
    
    const languageExtensions = {
        javascript: javascript({ jsx: true }),
        python: python(),
        java: java(),
        cpp: cpp()
    };
    
    const handleCodeChange = (value) => {
        setCode(value);
    };
    
    const handleSubmit = async () => {
        if (!code.trim()) {
            toast.error('Please write some code before submitting');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await submitSolution(code, language);
        } catch (error) {
            console.error('Error submitting solution:', error);
            toast.error('Failed to submit solution');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-[#0A0F1E] p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[#0DF2FF]">AI Coding Challenges</h1>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-[#FF007A] text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition"
                    >
                        Back to Dashboard
                    </button>
                </div>
                
                <UserProgressBar />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div className="h-[calc(100vh-240px)]">
                        <AIProblemDisplay />
                    </div>
                    
                    <div className="flex flex-col h-[calc(100vh-240px)]">
                        <div className="bg-[#172033] p-4 rounded-lg mb-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-white">Your Solution</h2>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="bg-[#0A0F1E] text-white px-3 py-1 rounded border border-[#0DF2FF]"
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                </select>
                            </div>
                            
                            <div className="h-[calc(100vh-400px)] overflow-hidden rounded border border-[#0A0F1E]">
                                <CodeMirror
                                    value={code}
                                    height="100%"
                                    theme={dracula}
                                    extensions={[languageExtensions[language]]}
                                    onChange={handleCodeChange}
                                />
                            </div>
                            
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || isLoading}
                                    className="bg-[#0DF2FF] text-black px-6 py-2 rounded-lg hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Solution'}
                                </button>
                            </div>
                        </div>
                        
                        {submissionResult && (
                            <div className="overflow-y-auto">
                                <SubmissionResults result={submissionResult} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChallengesPage;
