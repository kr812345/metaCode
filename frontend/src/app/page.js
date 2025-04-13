"use client"

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const Page = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user && user.token) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#0A0F1E]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0DF2FF]"></div>
    </div>
  );
}

export default Page;