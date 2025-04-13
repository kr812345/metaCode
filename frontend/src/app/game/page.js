'use client'
import SnakeGame from '@/components/SnakeGame';
import { useRouter } from 'next/navigation';

export default function GamePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative">
      <button 
        onClick={() => router.back()}
        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
      >
        Go Back
      </button>
      <SnakeGame />
    </div>
  );
} 