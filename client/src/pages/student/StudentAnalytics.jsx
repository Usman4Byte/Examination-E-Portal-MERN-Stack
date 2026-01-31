// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Button } from '../../components/common/Button';
// import {
//     LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
// } from 'recharts';
// import api from '../../services/api';

// export const StudentAnalytics = () => {
//     const [data, setData] = useState(null);

//     useEffect(() => {
//         api.get('/student/analytics')
//             .then(res => setData(res.data))
//             .catch(console.error);
//     }, []);

//     if (!data) return null;

//     return (
//         <div className="p-8 space-y-10">

//             {/* Header */}
//             <div>
//                 <h1 className="text-3xl font-bold">My Learning Insights</h1>
//                 <p className="text-gray-500">
//                     Understand your strengths, weaknesses, and progress
//                 </p>
//             </div>

//             {/* Mastery Card */}
//             <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-xl text-white">
//                 <p className="text-sm uppercase">Overall Mastery</p>
//                 <h2 className="text-4xl font-bold">{data.mastery}%</h2>
//                 <p className="text-sm mt-2">
//                     Based on your best performance in each subject
//                 </p>
//             </div>

//             {/* Subject Cards */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {data.subjects.map((s, idx) => (
//                     <div key={idx} className="bg-white p-6 rounded-xl border shadow-sm">
//                         <div className="flex justify-between items-center">
//                             <h3 className="text-xl font-bold">{s.subject}</h3>
//                             <span
//                                 className={
//                                     s.avgScore >= 70
//                                         ? 'text-emerald-600'
//                                         : 'text-red-600'
//                                 }
//                             >
//                                 Avg {s.avgScore}%
//                             </span>
//                         </div>

//                         <div className="grid grid-cols-4 text-sm mt-4">
//                             <div>
//                                 <p className="text-gray-400">Best</p>
//                                 <p className="font-bold">{s.bestScore}%</p>
//                             </div>
//                             <div>
//                                 <p className="text-gray-400">Attempts</p>
//                                 <p className="font-bold">{s.attempts}</p>
//                             </div>
//                             <div>
//                                 <p className="text-gray-400">Pass Rate</p>
//                                 <p className="font-bold">{s.passedRate}%</p>
//                             </div>
//                             <div>
//                                 <p className="text-gray-400">Trend</p>
//                                 <p className="font-bold">
//                                     {s.trend > 0 ? '↑ Improving' : s.trend < 0 ? '↓ Declining' : '→ Stable'}
//                                 </p>
//                             </div>
//                         </div>

//                         {/* Progress Chart */}
//                         <div className="h-40 mt-6">
//                             <ResponsiveContainer width="100%" height="100%">
//                                 <LineChart
//                                     data={s.history.map((v, i) => ({
//                                         attempt: i + 1,
//                                         score: v
//                                     }))}
//                                 >
//                                     <XAxis dataKey="attempt" />
//                                     <YAxis domain={[0, 100]} />
//                                     <Tooltip />
//                                     <Line
//                                         type="monotone"
//                                         dataKey="score"
//                                         stroke="#6366f1"
//                                         strokeWidth={2}
//                                     />
//                                 </LineChart>
//                             </ResponsiveContainer>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Focus Section */}
//             {data.weakSubjects.length > 0 && (
//                 <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-xl">
//                     <h3 className="font-bold mb-2">Focus Areas</h3>
//                     <p className="text-sm">
//                         You should focus more on:
//                         <strong> {data.weakSubjects.map(s => s.subject).join(', ')}</strong>
//                     </p>
//                 </div>
//             )}


//             <div>
//                 <Link to={"/student/analytics/details"}>
//                     <Button className="justify-center w-full mt-2">View Detailed Analysis</Button>
//                 </Link>
//             </div>

//         </div>





//     );
// };





import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid
} from 'recharts';
import api from '../../services/api';

export const StudentAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [examSearch, setExamSearch] = useState('');

    useEffect(() => {
        setLoading(true);
        api.get('/student/analytics')
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">My Learning Analytics</h1>
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 text-lg font-medium">Loading analytics...</p>
            </div>
        </div>
    );

    if (!data) return null;

    // Flatten subjects for chart
    const performanceData = data.subjects.map(s => ({
        name: s.subject,
        avgScore: s.avgScore
    }));

    const filteredPerformance = performanceData.filter(s =>
        s.name.toLowerCase().includes(examSearch.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Learning Analytics</h1>
                <p className="text-gray-500 text-sm sm:text-base">Track your progress, strengths, and weak areas.</p>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
                    <p className="text-xs sm:text-sm text-gray-500">Overall Mastery</p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-indigo-600 mt-2">{data.mastery}%</h3>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
                    <p className="text-xs sm:text-sm text-gray-500">Strong Subjects</p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">{data.strongSubjects.length}</h3>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
                    <p className="text-xs sm:text-sm text-gray-500">Weak Subjects</p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-red-600 mt-2">{data.weakSubjects.length}</h3>
                </div>
            </div>

            {/* Search Exams */}
            <input
                type="text"
                placeholder="Search subjects..."
                className="w-full px-4 sm:px-6 py-2 sm:py-3 border bg-white rounded-lg focus:outline-indigo-500 placeholder:text-gray-400 text-sm sm:text-base"
                value={examSearch}
                onChange={e => setExamSearch(e.target.value)}
            />

            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm h-64 sm:h-80">
                    <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base">Average Score per Subject</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={filteredPerformance} margin={{ top: 0, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="avgScore" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Weak Subjects List */}
                <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm h-64 sm:h-80 overflow-y-auto">
                    <h3 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">Focus Areas</h3>
                    {data.weakSubjects.length === 0 ? (
                        <p className="text-gray-500">No weak subjects. Keep up the great work!</p>
                    ) : (
                        <ul className="space-y-2">
                            {data.weakSubjects.map(s => (
                                <li key={s.subject} className="flex justify-between items-center p-2 bg-yellow-50 rounded-md border border-yellow-200">
                                    <span>{s.subject}</span>
                                    <span className="font-bold text-red-600">{s.avgScore}%</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Subject Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {data.subjects.map(s => (
                    <div key={s.subject} className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                            <h3 className="font-semibold text-sm sm:text-base">{s.subject}</h3>
                            <span className={`text-sm ${s.avgScore >= 70 ? 'text-emerald-600' : 'text-red-600'}`}>Avg {s.avgScore}%</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 text-xs sm:text-sm text-gray-500 mt-4 gap-3 sm:gap-4">
                            <div>
                                <p>Best</p>
                                <p className="font-bold">{s.bestScore}%</p>
                            </div>
                            <div>
                                <p>Attempts</p>
                                <p className="font-bold">{s.attempts}</p>
                            </div>
                            <div>
                                <p>Pass Rate</p>
                                <p className="font-bold">{s.passedRate}%</p>
                            </div>
                            <div>
                                <p>Trend</p>
                                <p className="font-bold">{s.trend > 0 ? '↑ Improving' : s.trend < 0 ? '↓ Declining' : '→ Stable'}</p>
                            </div>
                        </div>

                        <div className="h-32 sm:h-40 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={s.history.map((v, i) => ({ attempt: i + 1, score: v }))}>
                                    <XAxis dataKey="attempt" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <Link to="/student/analytics/details">
                    <Button className="justify-center w-full mt-4">View Detailed Analysis</Button>
                </Link>
            </div>
        </div>
    );
};
