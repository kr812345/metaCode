'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAICoding } from '@/contexts/AICodingContext';
import UserProgressBar from '@/components/UserProgressBar';
import UserAchievements from '@/components/UserAchievements';

const AIProgressPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { completedProblems, isLoading, refreshProgress, userLevel } = useAICoding();
    
    useEffect(() => {
        if (!user?.token) {
            router.push('/login');
            return;
        }
        
        refreshProgress();
    }, [user, router, refreshProgress]);
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0DF2FF]"></div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-[#0A0F1E] p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[#0DF2FF]">Your Coding Progress</h1>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => router.push('/ai-challenges')}
                            className="bg-[#0DF2FF] text-black px-4 py-2 rounded-lg hover:bg-opacity-80 transition"
                        >
                            Continue Coding
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-[#FF007A] text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
                
                <div className="bg-[#172033] p-6 rounded-lg mb-6">
                    <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-[#0DF2FF] flex items-center justify-center text-black text-2xl font-bold mr-4">
                            {userLevel}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Level {userLevel} Coder</h2>
                            <p className="text-gray-400">You've solved {completedProblems.length} problems</p>
                        </div>
                    </div>
                    
                    <UserProgressBar />
                </div>
                
                <UserAchievements />
                
                {completedProblems.length > 0 && (
                    <div className="mt-6 bg-[#172033] rounded-lg p-6">
                        <h2 className="text-xl font-bold text-[#0DF2FF] mb-4">Completed Problems</h2>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b border-gray-700">
                                        <th className="pb-2 text-gray-400">Problem</th>
                                        <th className="pb-2 text-gray-400">Language</th>
                                        <th className="pb-2 text-gray-400">Solved On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {completedProblems.map((problem, index) => (
                                        <tr key={index} className="border-b border-gray-800">
                                            <td className="py-3 text-white">Problem #{index + 1}</td>
                                            <td className="py-3 text-white">{problem.language}</td>
                                            <td className="py-3 text-gray-400">
                                                {new Date(problem.solvedAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIProgressPage;
