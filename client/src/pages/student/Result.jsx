import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { CheckCircle, XCircle, Home, RotateCcw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { StatCard } from './StudentDetailedAnalytics.jsx';
import api from '../../services/api.js';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


export const Result = () => {
  // In a real app, you would get these values from the router state or API
  // e.g., const { state } = useLocation();
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get('/student/results');
        setResults(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResults();
  }, []);

  if (results.length === 0) return <div>No results yet</div>;





  const latest = results[0];
  // const data = [
  //   { name: 'Score %', value: latest.score, color: '#10b981' },
  //   { name: 'Remaining', value: 100 - latest.score, color: '#f1f5f9' },
  // ];


  // const passColor = latest.passed ? '#22c55e' : '#ef4444';

  const pieData = [
    { name: 'Score', value: latest.score, color: latest.passed ? '#22c55e' : '#ef4444' },
    { name: 'Remaining', value: 100 - latest.score, color: '#e5e7eb' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl overflow-hidden">

        {/* Header Section */}
        <div className={`p-8 text-center ${latest.passed ? 'bg-emerald-50' : 'bg-red-50'}`}>
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            {latest.passed ? (
              <CheckCircle size={32} className="text-emerald-500" />
            ) : (
              <XCircle size={32} className="text-red-500" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {latest.passed ? 'Excellent Work!' : 'Keep Practicing'}
          </h1>
          <p className="text-gray-500 mt-2">
            <strong>{latest.exam.title}</strong>
          </p>
        </div>

        {/* Score Section */}
        <div className="p-8">
          <div className="h-48 w-full relative mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Centered Text inside Pie */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {/* <span className="text-4xl font-bold text-gray-900">{latest.score}%</span> */}
              <span className={`text-4xl font-bold ${latest.passed ? 'text-green-600' : 'text-red-600'}`}>{latest.score}%</span>
            </div>
          </div>

          {/* Stats Grid */}
          {/* <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl text-center">
              <p className="text-gray-400 text-xs uppercase font-bold">Total Questions</p>
              <p className="text-xl font-bold text-gray-900">{latest.exam.questions.length()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Stat title="Correct" value={latest.correctCount} color="text-green-600" />
              <Stat title="Incorrect" value={latest.incorrectCount} color="text-red-600" />
            </div>
          </div> */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Stat label="Questions" value={latest.totalQuestions} />
            <Stat label="Correct" value={latest.correctCount} color="text-green-600" />
            <Stat label="Wrong" value={latest.incorrectCount} color="text-red-600" />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link to="/student" className="flex-1">
              <Button variant="ghost" className="w-full">
                <Home size={18} className="mr-2" /> Dashboard
              </Button>
            </Link>
            <Link to="/student" className="flex-1">
              <Button className="w-full" onClick={() => navigate(`/student/exam/${latest.examId}`)}>
                <RotateCcw size={18} className="mr-2" /> Take Another
              </Button>
            </Link>
          </div>
        </div>

        {/* Attempts */}
        <div className="max-h-48 overflow-y-auto border-t">
          {results.map(r => (
            <div
              key={r._id}
              onClick={() => navigate(`/student/results/${r._id}`)}
              className={`p-3 cursor-pointer flex justify-between ${r.passed ? 'bg-green-50' : 'bg-red-50'
                }`}
            >
              <span>Attempt {r.attemptNumber}</span>
              <span className="font-bold">{r.score}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};




const Stat = ({ label, value, color = 'text-gray-900' }) => (
  <div className="bg-gray-50 p-4 rounded-xl text-center">
    <p className="text-xs text-gray-400 uppercase">{label}</p>
    <p className={`text-xl font-bold ${color}`}>{value}</p>
  </div>
);