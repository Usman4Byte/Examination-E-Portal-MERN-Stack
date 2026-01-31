import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import api from '../../services/api.js';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';






export const Analytics = () => {

  const [analytics, setAnalytics] = useState({
    totalExams: 0,
    avgScore: 0,
    activeStudents: 0,
    performance: [],
    recent: []
  });

  const [examSearch, setExamSearch] = useState('');


  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/teacher/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    };
    fetchAnalytics();
  }, []);


  const filteredPerformance = analytics.performance.filter(p =>
    p.name.toLowerCase().includes(examSearch.toLowerCase())
  );

  const filteredRecent = analytics.recent.filter(r =>
    r.student.toLowerCase().includes(examSearch.toLowerCase()) ||
    r.exam.toLowerCase().includes(examSearch.toLowerCase())
  );


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Performance Analytics</h1>
        <p className="text-gray-500 text-sm sm:text-base">Track student progress and exam difficulty.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
          <p className="text-xs sm:text-sm font-medium text-gray-500">Total Exams Taken</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-indigo-600 mt-2">{analytics.totalExams}</h3>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
          <p className="text-xs sm:text-sm font-medium text-gray-500">Average Class Score</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">{analytics.avgScore || 0}%</h3>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
          <p className="text-xs sm:text-sm font-medium text-gray-500">Active Students</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">{analytics.activeStudents || 0}</h3>
        </div>
      </div>


      {/* Searching option */}
      <input
        type="text"
        placeholder="Search exam in chart..."
        className="px-4 sm:px-6 py-3 sm:py-4 border-2 rounded-lg w-full hover:shadow-lg drop-shadow-black bg-white focus:outline-indigo-500 placeholder:text-base sm:placeholder:text-lg placeholder:text-neutral-600 hover:border-indigo-500 transition-all"
        value={examSearch}
        onChange={e => setExamSearch(e.target.value)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Chart 1: Average Scores */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm h-64 sm:h-80">
          <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base">Average Score per Exam</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredPerformance} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="avgScore" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Recent Activity List */}
        <div className='flex flex-col gap-2'>

          <div className="bg-white p-4 sm:p-6 rounded-xl h-64 sm:h-80 overflow-y-scroll border shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base">Recent Student Submissions</h3>
            <div className="space-y-3 sm:space-y-4 mb-4">
              {filteredRecent.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm sm:text-base flex-shrink-0">
                      {activity.student.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{activity.student}</p>
                      <p className="text-xs text-gray-500 truncate">{activity.exam}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-bold ${activity.score >= 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {activity.score}%
                    </span>
                    <p className="text-xs text-gray-400 mt-1 hidden sm:block">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
          <Link to={"/teacher/student-analytics"}>
            <Button className="justify-center w-full mt-2">
              View Detailed Analysis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};