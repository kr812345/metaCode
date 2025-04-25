'use client';

import { useEffect, useState } from 'react';
import { getRequest, postRequest } from '@/axiosReq/req.axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Loader from '@/components/Loader';
import { useAuth } from '@/contexts/AuthContext';

const ChallengesPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userProgress, setUserProgress] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchQuestions = async (level) => {
    setLoading(true);
    try {
      const response = await getRequest(`/questions/${level}`);
      if (response.success) {
        setQuestions(response.questions);
      } else {
        toast.error('Failed to fetch questions');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching questions');
    }
    setLoading(false);
  };

  const fetchUserProgress = async () => {
    try {
      const response = await getRequest('/questions/progress');
      if (response.success) {
        setUserProgress(response.progress);
        setLevel(response.progress.level);
        fetchQuestions(response.progress.level);
      } else {
        toast.error('Failed to fetch user progress');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching progress');
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await getRequest('/questions/leaderboard');
      if (response.success) {
        setLeaderboard(response.leaderboard);
      } else {
        toast.error('Failed to fetch leaderboard');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching leaderboard');
    }
  };

  const handleSubmit = async (questionId) => {
    try {
      const response = await postRequest('/questions/submit', { questionId });
      if (response.success) {
        toast.success('Solution submitted!');
        fetchUserProgress();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error submitting solution');
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchUserProgress();
    fetchLeaderboard();
  }, [user, router]);

  return (
    <div className="min-h-screen bg-[#010313] text-white p-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="lg:w-3/4">
          <h1 className="text-3xl font-bold text-[#0DF2FF] mb-4">Challenges</h1>
          {loading ? (
            <Loader />
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="bg-[#0A0F1E] p-4 rounded-xl shadow-md">
                  <h2 className="text-xl font-semibold text-[#0DF2FF]">{question.title}</h2>
                  <p className="text-gray-300 mb-2">{question.description}</p>
                  <button
                    onClick={() => handleSubmit(question._id)}
                    className="bg-[#0DF2FF] text-black font-bold py-1 px-4 rounded hover:bg-[#00c9cc] transition"
                  >
                    Submit Solution
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-[#0A0F1E] p-4 rounded-xl mb-6">
            <h2 className="text-xl font-bold text-[#0DF2FF] mb-2">Your Progress</h2>
            <p>Level: <span className="font-bold text-[#0DF2FF]">{userProgress?.level || 1}</span></p>
            <p>Questions Solved: <span className="font-bold text-[#0DF2FF]">{userProgress?.solvedQuestions?.length || 0}</span></p>
          </div>

          <div className="bg-[#0A0F1E] p-4 rounded-xl mb-6">
            <h2 className="text-xl font-bold text-[#0DF2FF] mb-2">Level {level} Questions</h2>
            <p>Complete all to level up!</p>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold text-[#0DF2FF] mb-2">🏆 Leaderboard</h2>
            <div className="space-y-2">
              {leaderboard.map((user, index) => (
                <div key={index} className="bg-[#0A0F1E] p-2 rounded flex justify-between items-center">
                  <div className="text-white">
                    <span className="font-semibold">{index + 1}. {user.name}</span>
                    <div className="text-sm text-gray-400">Level {user.level}</div>
                  </div>
                  <div className="text-[#0DF2FF] font-bold text-sm">
                    {user.solvedCount} 🔍
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;
