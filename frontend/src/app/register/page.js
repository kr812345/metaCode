'use client'

import React, { useMemo, useState } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { postRequest } from '@/axiosReq/req.axios';
import { useAuth } from '@/contexts/AuthContext';
import Particles from '@/components/Particles';

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
        setError('');
        setIsLoading(true);
        
        try {
            const res = await postRequest('/auth/register', {
                ...fields,
                avatar: {
                    name: fields.name,
                    color: `#${Math.floor(Math.random()*16777215).toString(16)}`
                }
            });

            if (res?.status === 201 && res?.data?.token) {
                login(res.data.token);
                toast.success('Registration successful!');
                router.push('/dashboard');
            } else {
                throw new Error(res?.data?.message || 'Registration failed');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const MemoizedParticles = useMemo(() => <Particles />, []);

    return (
        <div className='bg-[#0A0F1E] relative min-h-screen'>
            <div className='z-10 text-[#0DF2FF] text-center mt-8 ml-8 absolute font-bold text-2xl'>
                        metaCode
            </div> 
            {MemoizedParticles}
            <div className="relative z-10 flex flex-col items-center justify-center h-screen">
                <div className={`
                    bg-[#ffffff62]
                    border-2 border-[#0DF2FF] 
                    rounded-2xl py-8 px-4 
                    w-[344px]
                `}>
                    <h1 className="text-[#F4F5F7] text-3xl font-semibold mb-8 text-center">Register</h1>
                    
                    <div className="mb-4">
                        <label className='text-[#F4F5F7] font-medium ml-2 block mb-1'>Name</label>
                        <Input 
                            type='text' 
                            placeholder='Enter your name' 
                            value={fields.name}
                            handleChange={(e) => setField(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className='text-[#F4F5F7] font-medium ml-2 block mb-1'>Email</label>
                        <Input 
                            type='email' 
                            placeholder='Enter your email' 
                            value={fields.email}
                            handleChange={(e) => setField(prev => ({ ...prev, email: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className='text-[#F4F5F7] font-medium ml-2 block mb-1'>Password</label>
                        <Input 
                            type='password' 
                            placeholder='Enter your password' 
                            value={fields.password}
                            handleChange={(e) => setField(prev => ({ ...prev, password: e.target.value }))}
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
                            text={isLoading ? 'Registering...' : 'Register'} 
                            handle={handleSubmit}
                            type="submit"
                            disabled={isLoading}
                            />
                    </div>

                    <div className="text-center mt-16">
                        <span className="text-[#F4F5F7]">Already have an account? </span>
                        <Link href="/login" className="text-[#dedede] border-2 border-[#FF007A] rounded-md px-3 py-2 hover:underline">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
