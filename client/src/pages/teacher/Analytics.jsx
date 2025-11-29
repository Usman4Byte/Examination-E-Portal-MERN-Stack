import React from 'react';
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

// Mock Data for Analytics
const PERFORMANCE_DATA = [
  { name: 'React Basics', avgScore: 85, attempts: 24 },
  { name: 'Node.js Intro', avgScore: 65, attempts: 18 },
  { name: 'CSS Grid', avgScore: 92, attempts: 30 },
  { name: 'MongoDB', avgScore: 55, attempts: 12 },
  { name: 'Auth & Security', avgScore: 70, attempts: 20 },
];

const RECENT_ACTIVITY = [
  { id: 1, student: "Alice Johnson", exam: "React Basics", score: 90, date: "2 mins ago" },
  { id: 2, student: "Bob Smith", exam: "Node.js Intro", score: 45, date: "15 mins ago" },
  { id: 3, student: "Charlie Brown", exam: "CSS Grid", score: 100, date: "1 hour ago" },
];

export const Analytics = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
        <p className="text-gray-500">Track student progress and exam difficulty.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Exams Taken</p>
          <h3 className="text-3xl font-bold text-indigo-600 mt-2">1,284</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm font-medium text-gray-500">Average Class Score</p>
          <h3 className="text-3xl font-bold text-emerald-600 mt-2">78%</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm font-medium text-gray-500">Active Students</p>
          <h3 className="text-3xl font-bold text-blue-600 mt-2">156</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Average Scores */}
        <div className="bg-white p-6 rounded-xl border shadow-sm h-80">
          <h3 className="font-bold text-gray-900 mb-6">Average Score per Exam</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PERFORMANCE_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}} 
              />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="avgScore" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Recent Activity List */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">Recent Student Submissions</h3>
          <div className="space-y-4">
            {RECENT_ACTIVITY.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {activity.student.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.student}</p>
                    <p className="text-xs text-gray-500">{activity.exam}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                    activity.score >= 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {activity.score}%
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};