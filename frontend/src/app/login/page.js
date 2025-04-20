'use client'

import React, { useState, useMemo } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Particles from '../../components/Particles';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { postRequest } from '../../axiosReq/req.axios';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
    const [fields, setField] = useState({
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
            const res = await postRequest('/auth/login', fields);
            if (res && res.status === 200) {
                const token = res.data?.token;
                if (token) {
                    login(token);
                    router.push('/dashboard');
                } else {
                    throw new Error('No token received from server');
                }
            } else {
                throw new Error(res?.data?.message || 'Login failed');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMessage);
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Memoize the Particles component to prevent re-renders
    const MemoizedParticles = useMemo(() => <Particles />, []);

    return (
        <div className='bg-[#0A0F1E] relative min-h-screen'>
                <div className='z-10 text-[#0DF2FF] text-center mt-16 left-0 right-0 absolute font-bold text-2xl'>
                        metaCode
                </div>  
            {MemoizedParticles}
            <div className="relative z-10 flex flex-col items-center justify-center h-screen">
                <div className={`
                bg-white bg-opacity-50 backdrop-filter border-2 border-[#0DF2FF] backdrop-blur-lg rounded-2xl py-8 px-4 w-[344px]`}>
                    <h1 className="text-[#F4F5F7] text-3xl font-semibold mb-8 text-center">Login</h1>
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

                    <div className='w-full flex'>
                    <Button 
                        text={isLoading ? 'Logging in...' : 'Login'} 
                        handle={handleSubmit}
                        type="submit"
                        />
                    </div>    

                    <div className="text-center mt-16">
                        <span className="text-[#F4F5F7]">Don't have an account? </span>
                        <Link href="/register" className="text-[#ff007a] border-2 border-[#FF007A] rounded-md px-3 py-2 hover:bg-pink-400 hover:text-white transition">
                            Register
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
