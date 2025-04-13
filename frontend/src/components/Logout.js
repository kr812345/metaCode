'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const Logout = () => {
    const router = useRouter();

    useEffect(() => {
        // Remove token from localStorage
        localStorage.removeItem('token');
        
        // Show success message
        toast.success('Logged out successfully!');
        
        // Redirect to home page after a short delay
        setTimeout(() => {
            router.push('/');
        }, 1000);
    }, [router]);

    return null; // No need to render anything
};

export default Logout;
