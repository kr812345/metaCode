import React from 'react';
import { useAICoding } from '../contexts/AICodingContext';

const AIProblemDisplay = () => {
    const { currentProblem, isLoading, skipProblem } = useAICoding();

    if (isLoading) {
        return (
            <div className="bg-[#172033] p-6 rounded-lg h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0DF2FF]"></div>
            </div>
        );
    }

    if (!currentProblem) {
        return (
            <div className="bg-[#172033] p-6 rounded-lg h-full flex flex-col items-center justify-center">
                <p className="text-white mb-4">No problem loaded. Click the button below to get started!</p>
                <button 
                    onClick={() => fetchCurrentProblem()}
                    className="bg-[#0DF2FF] text-black px-4 py-2 rounded hover:bg-opacity-80 transition"
                >
                    Get Problem
                </button>
            </div>
        );
    }

    const { title, description, difficulty, testCases } = currentProblem;

    return (
        <div className="bg-[#172033] p-6 rounded-lg h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#0DF2FF]">{title}</h2>
                <span className={`text-xs px-2 py-1 rounded ${
                    difficulty === 'easy' ? 'bg-green-500' :
                    difficulty === 'medium' ? 'bg-yellow-500' :
                    'bg-red-500'
                }`}>
                    {difficulty}
                </span>
            </div>
            
            <div className="mb-6">
                <h3 className="text-white font-medium mb-2">Problem Description:</h3>
                <p className="text-gray-300 whitespace-pre-line">{description}</p>
            </div>
            
            <div className="mb-6">
                <h3 className="text-white font-medium mb-2">Example Test Cases:</h3>
                <div className="space-y-4">
                    {testCases.map((testCase, index) => (
                        <div key={index} className="bg-[#0A0F1E] p-3 rounded">
                            <div className="text-gray-400">Input: <span className="text-white font-mono">{testCase.input}</span></div>
                            <div className="text-gray-400">Output: <span className="text-white font-mono">{testCase.output}</span></div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="flex justify-end">
                <button 
                    onClick={skipProblem}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                >
                    Skip Problem
                </button>
            </div>
        </div>
    );
};

export default AIProblemDisplay;
