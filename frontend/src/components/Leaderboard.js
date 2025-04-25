import React, { useState, useEffect } from 'react';
import { getRequest } from '@/axiosReq/req.axios';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setIsLoading(true);
            const response = await getRequest('/questions/leaderboard');
            
            if (response.success) {
                setLeaderboard(response.leaderboard);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            // Use mock data if API fails
            setLeaderboard([
                { name: 'CodeMaster', level: 15, solvedCount: 75 },
                { name: 'AlgorithmGuru', level: 12, solvedCount: 60 },
                { name: 'ByteWizard', level: 10, solvedCount: 50 },
                { name: 'PixelNinja', level: 8, solvedCount: 40 },
                { name: 'DataDragon', level: 7, solvedCount: 35 }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-[#0A2342] rounded-lg p-4">
                <h2 className="text-lg font-bold text-[#0DF2FF] mb-4">Top Coders</h2>
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#0DF2FF]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0A2342] rounded-lg p-4">
            <h2 className="text-lg font-bold text-[#0DF2FF] mb-4">Top Coders</h2>
            
            {leaderboard.length === 0 ? (
                <p className="text-gray-400 text-center">No data available</p>
            ) : (
                <div className="space-y-3">
                    {leaderboard.map((user, index) => (
                        <div key={index} className="flex items-center bg-[#172033] p-3 rounded-lg">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0A0F1E] text-white font-bold mr-3">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-white">{user.name}</h3>
                                <div className="flex items-center text-sm">
                                    <span className="text-[#0DF2FF] mr-2">Level {user.level}</span>
                                    <span className="text-gray-400">{user.solvedCount} solved</span>
                                </div>
                            </div>
                            {index === 0 && (
                                <div className="text-2xl">👑</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
