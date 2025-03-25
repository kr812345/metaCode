import React from 'react';
import Form from 'next/form';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Particles from '@/components/Particles';
import Link from 'next/link';

const Register = () => {
    return (
        <>
            <div className='bg-[#0A0F1E] relative min-h-screen'>
                <Particles/>
                <div className=" relative z-10 flex flex-col items-center justify-center h-screen">
                    <div className={`
                    bg-[#ffffff62] bg-opacity-60
                    border-3 border-[#0DF2FF] 
                    rounded-2xl py-8 px-4 
                    w-[344px]`}>
                        <h1 className="text-[#F4F5F7] text-3xl font-semibold mb-8 text-center">Register</h1>
                        <Form formMethod='post' action='/register' >
                            <label className='text-[#F4F5F7] font-medium ml-2'>Username</label>
                            <Input type='username' placeholder='Username' name='username' />

                            <label className='text-[#F4F5F7] font-medium ml-2'>Email</label>
                            <Input type='email' placeholder='Email' name='email' />

                            <label className='text-[#F4F5F7] font-medium ml-2'>Password</label>
                            <Input type='password' placeholder='Password' name='password' />

                            <label className='text-[#F4F5F7] font-medium ml-2'>Confirm Password</label>
                            <Input type='password' placeholder='Confirm Password' name='confirmPassword' />

                            <div className='w-full flex justify-center mt-4 mb-8'>
                                <Button text='Register' type='submit' />
                            </div>
                        </Form>
                        <div className="flex items-center justify-center gap-4 text-white mt-4">
                            <p>Already on metaCode ?</p>
                            <Link href='/login'>
                                <Button text='Login' />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Register;
