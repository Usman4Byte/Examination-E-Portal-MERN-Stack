import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { CheckCircle, XCircle, Home, RotateCcw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const Result = () => {
  // In a real app, you would get these values from the router state or API
  // e.g., const { state } = useLocation();
  const mockResult = {
    examTitle: "React.js Fundamentals",
    score: 85,
    totalQuestions: 20,
    correctAnswers: 17,
    passed: true
  };

  const data = [
    { name: 'Correct', value: mockResult.score, color: '#10b981' }, // Emerald-500
    { name: 'Wrong', value: 100 - mockResult.score, color: '#f1f5f9' }, // Slate-100
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header Section */}
        <div className={`p-8 text-center ${mockResult.passed ? 'bg-emerald-50' : 'bg-red-50'}`}>
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            {mockResult.passed ? (
              <CheckCircle size={32} className="text-emerald-500" />
            ) : (
              <XCircle size={32} className="text-red-500" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mockResult.passed ? 'Excellent Work!' : 'Keep Practicing'}
          </h1>
          <p className="text-gray-500 mt-2">
            You have successfully completed <strong>{mockResult.examTitle}</strong>
          </p>
        </div>

        {/* Score Section */}
        <div className="p-8">
          <div className="h-48 w-full relative mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Centered Text inside Pie */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-bold text-gray-900">{mockResult.score}%</span>
              <span className="text-xs text-gray-400 uppercase font-medium">Score</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl text-center">
              <p className="text-gray-400 text-xs uppercase font-bold">Total Questions</p>
              <p className="text-xl font-bold text-gray-900">{mockResult.totalQuestions}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl text-center">
              <p className="text-gray-400 text-xs uppercase font-bold">Correct Answers</p>
              <p className="text-xl font-bold text-emerald-600">{mockResult.correctAnswers}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link to="/student" className="flex-1">
              <Button variant="ghost" className="w-full">
                <Home size={18} className="mr-2" /> Dashboard
              </Button>
            </Link>
            <Link to="/student" className="flex-1">
              <Button className="w-full">
                <RotateCcw size={18} className="mr-2" /> Take Another
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};