'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoom } from '@/contexts/RoomContext';
import { toast } from 'react-toastify';

const CreateRoom = ({ onClose }) => {
    const router = useRouter();
    const { createRoom } = useRoom();
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const newRoom = await createRoom(formData);
            if (newRoom) {
                onClose();
                router.push(`/room/${newRoom.id}`);
            }
        } catch (error) {
            console.error('Room creation error:', error);
            toast.error('An error occurred while creating the room');
            setIsLoading(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#ffffff62] bg-opacity-60 border-3 border-[#0DF2FF] rounded-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-4">Create New Room</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-white mb-2">Room Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 text-gray-700 border border-[#0DF2FF] focus:outline-none focus:border-[#FF007A]"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-white mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 text-gray-800 border border-[#0DF2FF] focus:outline-none focus:border-[#FF007A]"
                            rows="3"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg bg-[#FF007A] text-white hover:bg-[#ff7aba] transition disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Create Room'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoom;