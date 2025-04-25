import React from 'react';
import { useAICoding } from '@/contexts/AICodingContext';

const UserAchievements = () => {
    const { userLevel, completedProblems } = useAICoding();
    
    const achievements = [
        { id: 1, name: 'First Steps', description: 'Solve your first problem', unlocked: completedProblems.length > 0 },
        { id: 2, name: 'Getting Started', description: 'Reach level 2', unlocked: userLevel >= 2 },
        { id: 3, name: 'Code Warrior', description: 'Reach level 5', unlocked: userLevel >= 5 },
        { id: 4, name: 'Problem Solver', description: 'Solve 10 problems', unlocked: completedProblems.length >= 10 },
        { id: 5, name: 'Code Master', description: 'Reach level 10', unlocked: userLevel >= 10 },
        { id: 6, name: 'Persistence', description: 'Solve 5 problems in a row', unlocked: false }, // This would need additional tracking
    ];
    
    return (
        <div className="bg-[#172033] rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#0DF2FF] mb-4">Your Achievements</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                    <div 
                        key={achievement.id}
                        className={`p-4 rounded-lg border ${
                            achievement.unlocked 
                                ? 'border-[#0DF2FF] bg-[#0DF2FF] bg-opacity-10' 
                                : 'border-gray-600 bg-[#0A0F1E] opacity-60'
                        }`}
                    >
                        <div className="flex items-center mb-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                                achievement.unlocked ? 'bg-[#0DF2FF] text-black' : 'bg-gray-700 text-gray-400'
                            }`}>
                                {achievement.unlocked ? '✓' : '?'}
                            </div>
                            <h3 className={`font-bold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                                {achievement.name}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserAchievements;
