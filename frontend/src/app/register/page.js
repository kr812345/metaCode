'use client'

import React, { useState, useMemo } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Particles from '@/components/Particles';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { postRequest } from '@/axiosReq/req.axios';
import { useAuth } from '@/contexts/AuthContext';

const Register = () => {
    const [fields, setField] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await postRequest('/api/auth/register', fields);
            if (res && res.status === 201) {
                const token = res.data?.token;
                if (token) {
                    login(token);
                    toast.success('Registration successful!');
                    router.push('/dashboard');
                } else {
                    throw new Error('No token received from server');
                }
            } else {
                throw new Error(res?.data?.message || 'Registration failed');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Registration error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Memoize the Particles component to prevent re-renders
    const MemoizedParticles = useMemo(() => <Particles />, []);

    return (
        <div className='bg-[#0A0F1E] relative min-h-screen'>
            {MemoizedParticles}
            <div className="relative z-10 flex flex-col items-center justify-center h-screen">
                <div className={`
                bg-[#ffffff62] bg-opacity-60
                border-3 border-[#0DF2FF] 
                rounded-2xl py-8 px-4 
                w-[344px]`}>
                    <h1 className="text-[#F4F5F7] text-3xl font-semibold mb-8 text-center">Register</h1>
                    <div className="mb-4">
                        <label className='text-[#F4F5F7] font-medium ml-2 block mb-1'>Name</label>
                        <Input 
                            type='text' 
                            placeholder='Enter your name' 
                            value={fields.name}
                            handleChange={(e) => (setField((prev) => ({ ...prev, name: e.target.value })))}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className='text-[#F4F5F7] font-medium ml-2 block mb-1'>Email</label>
                        <Input 
                            type='email' 
                            placeholder='Enter your email' 
                            value={fields.email}
                            handleChange={(e) => (setField((prev) => ({ ...prev, email: e.target.value })))}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className='text-[#F4F5F7] font-medium ml-2 block mb-1'>Password</label>
                        <Input 
                            type='password' 
                            placeholder='Enter your password' 
                            value={fields.password}
                            handleChange={(e) => (setField((prev) => ({ ...prev, password: e.target.value })))}
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm mb-4 text-center">
                            {error}
                        </div>
                    )}

                    <Button 
                        text={isLoading ? 'Registering...' : 'Register'} 
                        handle={handleSubmit}
                        type="submit"
                    />

                    <div className="text-center mt-4">
                        <span className="text-[#F4F5F7]">Already have an account? </span>
                        <Link href="/login" className="text-[#FF007A] hover:underline">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
