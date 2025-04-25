import React from 'react';

const CodingProgress = ({ progress }) => {
    if (!progress) {
        return null;
    }

    const { level, solvedQuestions, questionsToLevelUp } = progress;
    const progressPercentage = (solvedQuestions.length / questionsToLevelUp) * 100;

    return (
        <div className="bg-[#0A2342] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-[#0DF2FF]">Your Coding Progress</h2>
                <div className="text-white">
                    Level <span className="text-[#FF007A] font-bold">{level}</span>
                </div>
            </div>
            
            <div className="flex items-center">
                <div className="flex-1 bg-gray-700 h-4 rounded-full overflow-hidden">
                    <div 
                        className="bg-[#0DF2FF] h-full transition-all duration-500" 
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <div className="ml-4 text-white">
                    {solvedQuestions.length}/{questionsToLevelUp}
                </div>
            </div>
            
            <div className="mt-2 text-gray-300 text-sm">
                Solve {questionsToLevelUp - solvedQuestions.length} more questions to level up
            </div>
        </div>
    );
};

export default CodingProgress;
