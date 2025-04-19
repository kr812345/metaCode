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
            setUser({ token });
        }
        setIsLoading(false);
    }, [cookies.token]);

    const login = (token) => {
        // Set cookie with secure options
        setCookie('token', token, {
            path: '/',
            maxAge: 7200, // 2 hours
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        setUser({ token });
    };

    const logout = async () => {
        try {
            // Clear token cookie with all security options
            removeCookie('token', { 
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
            
            // Clear user state
            setUser(null);
            
            // Clean up localStorage
            localStorage.clear();
            
            // Remove any session data
            sessionStorage.clear();

            return true;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const getToken = () => {
        return cookies.token;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, getToken, isLoading }}>
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