'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [cookies, setCookie, removeCookie] = useCookies(['token']);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = cookies.token;
        if (token) {
            // You can add a function here to fetch user data if needed
            setUser({ token });
        }
        setIsLoading(false);
    }, [cookies.token]);

    const login = (token) => {
        setCookie('token', token, { path: '/', maxAge: 7200 });
        setUser({ token });
    };

    const logout = () => {
        try {
            // Remove token from cookies
            removeCookie('token', { path: '/' });
            
            // Clear user state
            setUser(null);
            
            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('roomId');
            localStorage.removeItem('roomName');
            
            // Disconnect socket if it exists
            if (window.socket) {
                window.socket.disconnect();
            }
            
            // Redirect to login page
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if there's an error, still try to redirect
            router.push('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 