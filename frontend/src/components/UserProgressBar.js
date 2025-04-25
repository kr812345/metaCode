import React from 'react';
import { useAICoding } from '../contexts/AICodingContext';

const UserProgressBar = () => {
    const { userLevel, problemsSolved } = useAICoding();
    const problemsNeeded = 5; // Number of problems needed to level up
    const progressPercentage = (problemsSolved / problemsNeeded) * 100;

    return (
        <div className="bg-[#172033] p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <div className="text-[#0DF2FF] font-bold">Level {userLevel}</div>
                <div className="text-white text-sm">{problemsSolved}/{problemsNeeded} Problems</div>
            </div>
            <div className="w-full bg-[#0A0F1E] rounded-full h-2.5">
                <div 
                    className="bg-[#0DF2FF] h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
                Solve {problemsNeeded - problemsSolved} more problems to level up
            </div>
        </div>
    );
};

export default UserProgressBar;
