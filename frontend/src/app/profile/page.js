'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getRequest } from '@/axiosReq/req.axios';
import toast from 'react-hot-toast';
import CodingProgress from '@/components/CodingProgress';

const ProfilePage = () => {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [userProgress, setUserProgress] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [achievements, setAchievements] = useState([]);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        fetchUserData();
    }, [user, router]);

    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            const progressResponse = await getRequest('/questions/progress');
            
            if (progressResponse.success) {
                setUserProgress(progressResponse.progress);
                
                // Generate achievements based on progress
                generateAchievements(progressResponse.progress);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error('Failed to load profile data');
        } finally {
            setIsLoading(false);
        }
    };

    const generateAchievements = (progress) => {
        if (!progress) return;
        
        const newAchievements = [];
        
        // Level-based achievements
        if (progress.level >= 1) {
            newAchievements.push({
                title: 'Coding Novice',
                description: 'Reached Level 1 in coding challenges',
                icon: '🌱',
                unlocked: true
            });
        }
        
        if (progress.level >= 5) {
            newAchievements.push({
                title: 'Coding Apprentice',
                description: 'Reached Level 5 in coding challenges',
                icon: '🌿',
                unlocked: true
            });
        }
        
        if (progress.level >= 10) {
            newAchievements.push({
                title: 'Coding Adept',
                description: 'Reached Level 10 in coding challenges',
                icon: '🌳',
                unlocked: true
            });
        }
        
        if (progress.level >= 15) {
            newAchievements.push({
                title: 'Coding Master',
                description: 'Reached Level 15 in coding challenges',
                icon: '🏆',
                unlocked: true
            });
        }
        
        if (progress.level >= 20) {
            newAchievements.push({
                title: 'Coding Legend',
                description: 'Reached Level 20 in coding challenges',
                icon: '👑',
                unlocked: true
            });
        }
        
        // Add locked achievements for future levels
        if (progress.level < 5) {
            newAchievements.push({
                title: 'Coding Apprentice',
                description: 'Reach Level 5 in coding challenges',
                icon: '🔒',
                unlocked: false
            });
        }
        
        if (progress.level < 10) {
            newAchievements.push({
                title: 'Coding Adept',
                description: 'Reach Level 10 in coding challenges',
                icon: '🔒',
                unlocked: false
            });
        }
        
        setAchievements(newAchievements);
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully!');
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Logout failed. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0DF2FF]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0F1E] pt-16 pb-20">
            <div className="container mx-auto p-4">
                <div className="bg-[#0A2342] rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-4">
                        <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mr-4"
                            style={{ backgroundColor: user?.avatar?.color || '#3498db' }}
                        >
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                            <p className="text-gray-400">{user?.email}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-4">
                        <button 
                            onClick={() => router.push('/dashboard')}
                            className="px-4 py-2 bg-[#0DF2FF] text-black rounded-lg hover:bg-opacity-80 transition"
                        >
                            Dashboard
                        </button>
                        <button 
                            onClick={() => router.push('/challenges')}
                            className="px-4 py-2 bg-[#FF007A] text-white rounded-lg hover:bg-opacity-80 transition"
                        >
                            Coding Challenges
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-opacity-80 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
                
                {userProgress && (
                    <div className="mb-6">
                        <CodingProgress progress={userProgress} />
                    </div>
                )}
                
                <div className="bg-[#0A2342] rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-[#0DF2FF] mb-4">Coding Achievements</h2>
                    
                    {achievements.length === 0 ? (
                        <p className="text-gray-400">Complete coding challenges to earn achievements!</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {achievements.map((achievement, index) => (
                                <div 
                                    key={index}
                                    className={`p-4 rounded-lg ${
                                        achievement.unlocked 
                                            ? 'bg-[#0DF2FF] bg-opacity-10 border border-[#0DF2FF]' 
                                            : 'bg-gray-800 border border-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center mb-2">
                                        <div className="text-2xl mr-3">{achievement.icon}</div>
                                        <h3 className={`font-bold ${achievement.unlocked ? 'text-[#0DF2FF]' : 'text-gray-400'}`}>
                                            {achievement.title}
                                        </h3>
                                    </div>
                                    <p className="text-gray-400 text-sm">{achievement.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="bg-[#0A2342] rounded-lg p-6">
                    <h2 className="text-xl font-bold text-[#0DF2FF] mb-4">Stats</h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[#172033] p-4 rounded-lg">
                            <h3 className="text-gray-400 text-sm mb-1">Current Level</h3>
                            <p className="text-2xl font-bold text-[#0DF2FF]">{userProgress?.level || 1}</p>
                        </div>
                        
                        <div className="bg-[#172033] p-4 rounded-lg">
                            <h3 className="text-gray-400 text-sm mb-1">Solved Problems</h3>
                            <p className="text-2xl font-bold text-[#FF007A]">
                                {userProgress ? (userProgress.level - 1) * 5 + userProgress.solvedQuestions.length : 0}
                            </p>
                        </div>
                        
                        <div className="bg-[#172033] p-4 rounded-lg">
                            <h3 className="text-gray-400 text-sm mb-1">Rooms Joined</h3>
                            <p className="text-2xl font-bold text-[#0DF2FF]">0</p>
                        </div>
                        
                        <div className="bg-[#172033] p-4 rounded-lg">
                            <h3 className="text-gray-400 text-sm mb-1">Time Spent</h3>
                            <p className="text-2xl font-bold text-[#FF007A]">0h</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
