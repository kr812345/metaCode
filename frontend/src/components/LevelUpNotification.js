import React, { useEffect, useState } from 'react';

const LevelUpNotification = ({ level, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                onClose();
            }, 500);
        }, 5000);
        
        return () => clearTimeout(timer);
    }, [onClose]);
    
    return (
        <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
        }`}>
            <div className="absolute inset-0 bg-black bg-opacity-70"></div>
            <div className="relative bg-[#172033] border-4 border-[#0DF2FF] rounded-lg p-8 max-w-md text-center transform transition-all duration-300 scale-110">
                <div className="text-4xl font-bold text-[#0DF2FF] mb-4">Level Up!</div>
                <div className="text-6xl font-bold text-white mb-6">{level}</div>
                <p className="text-xl text-gray-300 mb-6">
                    Congratulations! You've reached level {level}!
                </p>
                <p className="text-gray-400 mb-8">
                    New challenges await you. Keep coding to unlock more achievements!
                </p>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(() => onClose(), 500);
                    }}
                    className="bg-[#FF007A] text-white px-6 py-3 rounded-lg hover:bg-opacity-80 transition"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default LevelUpNotification;
