'use client'

import { redirect } from 'next/dist/server/api-utils';
import Link from 'next/link';
import React, { useEffect } from 'react';


const Page = () => {

  useEffect(() => {
    window.location.href = '/login';
  }, []);

  return (
    <div>
      
    </div>
  );
}

export default Page;
