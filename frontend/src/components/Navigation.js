'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
    const { user } = useAuth();
    const pathname = usePathname();
    
    // Don't show navigation on login/register pages
    if (pathname === '/login' || pathname === '/register') {
        return null;
    }
    
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0A2342] border-t border-[#0DF2FF] p-2 z-50">
            <div className="container mx-auto flex justify-around items-center">
                <Link href="/dashboard" className={`flex flex-col items-center p-2 rounded-lg ${pathname === '/dashboard' ? 'bg-[#0DF2FF] bg-opacity-20' : 'hover:bg-[#0DF2FF] hover:bg-opacity-10'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-xs text-white">Home</span>
                </Link>
                
                <Link href="/challenges" className={`flex flex-col items-center p-2 rounded-lg ${pathname.startsWith('/challenges') ? 'bg-[#0DF2FF] bg-opacity-20' : 'hover:bg-[#0DF2FF] hover:bg-opacity-10'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-xs text-white">Challenges</span>
                </Link>
                
                <Link href="/rooms" className={`flex flex-col items-center p-2 rounded-lg ${pathname.startsWith('/room') ? 'bg-[#0DF2FF] bg-opacity-20' : 'hover:bg-[#0DF2FF] hover:bg-opacity-10'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-xs text-white">Rooms</span>
                </Link>
                
                <Link href="/game" className={`flex flex-col items-center p-2 rounded-lg ${pathname === '/game' ? 'bg-[#0DF2FF] bg-opacity-20' : 'hover:bg-[#0DF2FF] hover:bg-opacity-10'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-white">Games</span>
                </Link>
                
                <Link href="/profile" className={`flex flex-col items-center p-2 rounded-lg ${pathname === '/profile' ? 'bg-[#0DF2FF] bg-opacity-20' : 'hover:bg-[#0DF2FF] hover:bg-opacity-10'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs text-white">Profile</span>
                </Link>
            </div>
        </nav>
    );
};

export default Navigation;
