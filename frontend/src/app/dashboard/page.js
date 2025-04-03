'use client'

import React from 'react';
import Particles from '@/components/Particles';
import Link from 'next/link';
import HomeIcon from '../../../public/home.svg'; 
import Image from 'next/image';
import SpaceCard from '@/components/SpaceCard';
import LogoutIcon from '../../../public/logout.svg'; // Import the logout icon

const Dashboard = () => {
    

    return (
        <>
            <div className='bg-[#0A0F1E] relative min-h-screen'>
                <Particles/>
                <div className='relative z-10'>
                    {/* Header */}
                    <div className='fixed z-10 w-full h-[80px] bg-[#0C1738] shadow-[0px_0px_5px_rgba(72,70,70,1)] flex items-center justify-between px-16'>
                        <Link href='/'>
                        <h1 className='text-white text-2xl'>metaCode</h1>
                        </Link>
                        <div className='flex items-center'>
                            <button className='bg-[#0DF2FF] hover:text-[#0DF2FF] border border-[#0A0F1E] rounded-lg px-8 py-2 hover:bg-[#0c1738c8] transition shadow-[0px_0px_8px_rgba(13,242,255,1)]'>
                                Create Space
                            </button>
                            <Link href='/login'>
                            <button className='ml-8 -mr-8' onClick={() => console.log('Logout clicked')}>
                                <Image src={LogoutIcon} alt='Logout' width={28} height={28} />
                            </button>
                            </Link>
                        </div>
                    </div>

                    {/* Space Cards */}
                    <div className='pt-[100px] px-[16px] py-[16px] grid grid-cols-4 gap-[16px] not-md:grid-cols-3 not-sm:grid-cols-1'>
                        {[1,2,3].map((_, i) => (
                            <div key={i}>
                                <SpaceCard title='My Space'/>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;
