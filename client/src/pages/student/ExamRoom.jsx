import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_EXAMS } from '../../data/mockData';
import { Button } from '../../components/common/Button';
import { Timer, AlertCircle } from 'lucide-react';

export const ExamRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const exam = MOCK_EXAMS.find(e => e.id === id);
  
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(exam?.duration * 60 || 0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    alert("Exam Submitted! (Normally this saves to DB)");
    navigate('/student/results');
  };

  if (!exam) return <div>Exam not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-4xl bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center mb-6">
        <div>
          <h2 className="font-bold text-lg">{exam.title}</h2>
          <p className="text-gray-500 text-sm">Question {currentQ + 1} / {exam.questions.length}</p>
        </div>
        <div className="flex items-center gap-2 text-indigo-600 font-mono text-xl font-bold">
          <Timer size={24}/>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Question */}
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-sm border mb-8">
        <h3 className="text-2xl font-medium text-gray-800 mb-8">
          {exam.questions[currentQ].text}
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {exam.questions[currentQ].options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setAnswers({...answers, [currentQ]: idx})}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                answers[currentQ] === idx 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium' 
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <span className="mr-3">{String.fromCharCode(65 + idx)}.</span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-4xl flex justify-between">
        <Button 
          variant="ghost" 
          disabled={currentQ === 0}
          onClick={() => setCurrentQ(currentQ - 1)}
        >
          Previous
        </Button>
        
        {currentQ === exam.questions.length - 1 ? (
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            Submit Exam
          </Button>
        ) : (
          <Button onClick={() => setCurrentQ(currentQ + 1)}>
            Next Question
          </Button>
        )}
      </div>
    </div>
  );
};