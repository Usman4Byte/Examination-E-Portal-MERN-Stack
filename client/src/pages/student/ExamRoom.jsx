import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';

import { Button } from '../../components/common/Button';
import { Timer, AlertCircle } from 'lucide-react';

export const ExamRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);

  const [currentQ, setCurrentQ] = useState(0);

  // const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null); // current selected option
  const [markedOptions, setMarkedOptions] = useState({}); // tracks answers and correctness
  const [submitted, setSubmitted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(exam?.duration * 60 || 0);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/student/exams/${id}`);
        setExam(res.data);
        setTimeLeft(res.data.duration * 60);
      } catch (err) {
        if (err.response?.status === 403) {
          alert(err.response.data.message);
        }
        navigate('/student');
      }
    };
    fetchExam();
  }, [id, navigate]);

  useEffect(() => {
    if (!exam || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          setSubmitted(true);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, submitted]);




  const handleSubmit = async () => {
    if (Object.keys(markedOptions).length !== exam.questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }
    try {
      // Convert markedOptions → answers payload
      const answersPayload = {};

      Object.keys(markedOptions).forEach(qIndex => {
        answersPayload[qIndex] = markedOptions[qIndex].selected;
      });

      const res = await api.post(`/student/exams/${id}/submit`, { answers: answersPayload });
      alert(`Exam submitted! Score: ${res.data.score}, Passed: ${res.data.passed}`);
      navigate('/student/results');
    } catch (err) {
      if (err.response?.status === 403) {
        alert(err.response.data.message);
        navigate('/student');
      } else {
        alert('Submission failed. Try again.');
      };
    }

  };

  if (!exam) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-4xl bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center mb-6">
        <div>
          <h2 className="font-bold text-lg">{exam.title}</h2>
          <p className="text-gray-500 text-sm">Question {currentQ + 1} / {exam.questions.length}</p>
        </div>
        <div className="flex items-center gap-2 text-indigo-600 font-mono text-xl font-bold">
          <Timer size={24} />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Question */}
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-sm border mb-8">
        <h3 className="text-2xl font-medium text-gray-800 mb-8">
          {exam.questions[currentQ].text}
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {exam.questions[currentQ].options.map((opt, idx) => {

            const isMarked = markedOptions[currentQ] !== undefined;
            const userSelectedIndex = markedOptions[currentQ]?.selected;
            const correctIndex = markedOptions[currentQ]?.correctIndex;
            // const isSelected = selectedOption === idx;
            const isUserChoice = userSelectedIndex === idx;
            const isCorrectChoice = correctIndex === idx;
            const isTempSelected = selectedOption === idx;

            return (
              <button
                key={idx}
                onClick={() => !isMarked && setSelectedOption(idx)
                  /*setAnswers({ ...answers, [currentQ]: idx })*/
                }
                disabled={isMarked}
                className={`text-left p-4 rounded-lg border-2 transition-all ${isMarked
                  ? isCorrectChoice
                    ? 'border-green-500 bg-green-50'
                    : isUserChoice
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                  : isTempSelected
                    ? 'border-indigo-600 bg-indigo-50 font-medium'
                    : 'border-gray-200 hover:border-indigo-300'
                  }`}
              >
                <span className="mr-3">{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </button>
            )
          })}
          <Button
            onClick={() => {
              if (selectedOption === null) {
                alert('Please select an option first');
                return;
              }

              // const correctIndex = markedOptions[currentQ]?.correctIndex;


              setMarkedOptions(prev => ({
                ...prev,
                [currentQ]: {
                  selected: selectedOption,
                  correctIndex: exam.questions[currentQ].correct,
                }
              }));

              // reset selection for next question
              setSelectedOption(null);
            }}
            disabled={markedOptions[currentQ] !== undefined}
          >
            Mark Answer
          </Button>


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
          <Button onClick={handleSubmit} disabled={markedOptions[currentQ] === undefined} className="bg-green-600 hover:bg-green-700">
            Submit Exam
          </Button>
        ) : (
          <Button onClick={() => setCurrentQ(currentQ + 1)}
            disabled={markedOptions[currentQ] === undefined || currentQ === exam.questions.length - 1}
          >
            Next Question
          </Button>
        )}
      </div>
    </div>
  );
};