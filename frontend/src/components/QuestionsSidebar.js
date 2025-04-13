import React, { useState, useEffect } from 'react';

const QuestionsSidebar = ({ onQuestionSelect }) => {
    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    useEffect(() => {
        // Fetch questions from the JSON file
        fetch('/questions.json')
            .then(response => response.json())
            .then(data => {
                setQuestions(data);
                if (data.length > 0) {
                    setSelectedQuestion(data[0]);
                    onQuestionSelect(data[0]);
                }
            })
            .catch(error => console.error('Error loading questions:', error));
    }, []);

    const handleQuestionClick = (question) => {
        setSelectedQuestion(question);
        onQuestionSelect(question);
    };

    return (
        <div className="w-64 h-full bg-[#172033] overflow-y-scroll border-r border-[#0DF2FF]">
            <div className="p-4">
                <h3 className="text-lg font-bold text-[#0DF2FF] mb-4">Problems</h3>
                <div className="space-y-2">
                    {questions.map((question, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded cursor-pointer transition ${
                                selectedQuestion === question
                                    ? 'bg-[#0DF2FF] bg-opacity-20 border border-[#0DF2FF]'
                                    : 'bg-[#0A0F1E] hover:bg-[#0DF2FF] hover:bg-opacity-10'
                            }`}
                            onClick={() => handleQuestionClick(question)}
                        >
                            <h4 className="font-medium text-white">{question.title}</h4>
                            <div className="flex items-center mt-1">
                                <span className={`text-xs px-2 py-1 rounded ${
                                    question.difficulty === 'easy' ? 'bg-green-500' :
                                    question.difficulty === 'medium' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                }`}>
                                    {question.difficulty}
                                </span>
                                <span className="text-xs text-gray-400 ml-2">
                                    {question.category}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestionsSidebar; 