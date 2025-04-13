'use client'
import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { dracula } from '@uiw/codemirror-theme-dracula';
import toast from 'react-hot-toast';
import axios from 'axios';
import QuestionsSidebar from './QuestionsSidebar';

const CodeEditor = ({ code, onCodeChange, roomMembers }) => {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentCode, setCurrentCode] = useState(code || '');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');

    const languageExtensions = {
        javascript: javascript({ jsx: true }),
        python: python(),
        java: java(),
        cpp: cpp()
    };

    const handleQuestionSelect = (question) => {
        setCurrentQuestion(question);
        setCurrentCode('');
        if (onCodeChange) {
            onCodeChange('');
        }
    };

    const handleChange = (value) => {
        setCurrentCode(value);
        if (onCodeChange) {
            onCodeChange(value);
        }
    };

    const submitCode = async () => {
        if (!currentQuestion) return;
        
        setSubmitting(true);
        setResult(null);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            let allTestsPassed = true;
            let testResults = [];
            
            for (const testCase of currentQuestion.testCases) {
                try {
                    const result = {
                        input: testCase.input,
                        expected: testCase.output,
                        actual: "Mock result",
                        passed: true
                    };
                    testResults.push(result);
                } catch (error) {
                    testResults.push({
                        input: testCase.input,
                        expected: testCase.output,
                        actual: `Error: ${error.message}`,
                        passed: false
                    });
                    allTestsPassed = false;
                }
            }
            
            setResult({
                success: allTestsPassed,
                message: allTestsPassed ? 'All tests passed!' : 'Some tests failed.',
                testResults
            });
            
            if (allTestsPassed) {
                toast.success('Congratulations! All tests passed!');
            } else {
                toast.error('Some tests failed. Check the results for details.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            setResult({
                success: false,
                message: `Error: ${error.message}`,
                testResults: []
            });
            toast.error('Failed to submit code. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="h-[calc(100vh-56px)] flex flex-col bg-[#0A0F1E]">
            <div className="p-4 bg-[#0A2342] flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#0DF2FF]">Collaborative Code Editor</h2>
                <div className="flex items-center space-x-4">
                    <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="bg-[#172033] text-white px-3 py-1 rounded border border-[#0DF2FF]"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                    <div className="flex space-x-2">
                        {roomMembers.map((member) => (
                            <div 
                                key={member.userId} 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                style={{ backgroundColor: member.avatar?.color || '#3498db' }}
                                title={member.name}
                            >
                                {member.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex-1 flex overflow-hidden">
                <div className="w-64 overflow-y-auto">
                    <QuestionsSidebar onQuestionSelect={handleQuestionSelect} />
                </div>
                
                <div className="flex-1 flex overflow-hidden">
                    <div className="w-1/2 overflow-y-auto p-4 bg-[#172033] border-r border-[#0DF2FF]">
                        {currentQuestion && (
                            <>
                                <h3 className="text-lg font-bold text-[#0DF2FF] mb-2">
                                    {currentQuestion.title}
                                </h3>
                                <p className="text-gray-300 mb-4 whitespace-pre-line">
                                    {currentQuestion.description}
                                </p>
                            </>
                        )}
                    </div>
                    
                    <div className="w-1/2 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-hidden">
                            <CodeMirror
                                value={currentCode}
                                height="100%"
                                theme={dracula}
                                extensions={[languageExtensions[selectedLanguage]]}
                                onChange={handleChange}
                                className="h-full"
                            />
                        </div>
                        
                        <div className="p-4 bg-[#172033] flex flex-col">
                            <div className="flex justify-between mb-2">
                                <button
                                    className="px-4 py-2 bg-[#FF007A] text-white rounded hover:bg-opacity-80 transition"
                                    onClick={submitCode}
                                    disabled={submitting || !currentQuestion}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Solution'}
                                </button>
                                <button
                                    className="px-4 py-2 bg-[#0DF2FF] text-black rounded hover:bg-opacity-80 transition"
                                    onClick={() => {
                                        setCurrentCode('');
                                        if (onCodeChange) {
                                            onCodeChange('');
                                        }
                                    }}
                                >
                                    Reset Code
                                </button>
                            </div>
                            
                            {result && (
                                <div className={`p-3 rounded border ${
                                    result.success 
                                        ? 'bg-green-900 bg-opacity-20 border-green-500' 
                                        : 'bg-red-900 bg-opacity-20 border-red-500'
                                }`}>
                                    <h4 className="font-bold text-white mb-2">{result.message}</h4>
                                    {result.testResults.map((test, index) => (
                                        <div key={index} className="mb-2">
                                            <div className="text-gray-400">Input: {test.input}</div>
                                            <div className="text-gray-400">Expected: {test.expected}</div>
                                            <div className={test.passed ? 'text-green-400' : 'text-red-400'}>
                                                Actual: {test.actual}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;