import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';

export const StudentDetailedAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'subject', direction: 'asc' });

    useEffect(() => {
        setLoading(true);
        api.get('/student/analytics')
            .then(res => {
                setData(res.data);
                setSelected(res.data.subjects[0]?.subject);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Detailed Analytics</h1>
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 text-lg font-medium">Loading analytics...</p>
            </div>
        </div>
    );

    if (!data) return null;

    const subject = data.subjects.find(s => s.subject === selected);

    // Sorting function for table
    // Sorting function for table including Status
    const sortedSubjects = [...data.subjects].sort((a, b) => {
        if (!sortConfig.key) return 0;

        // Determine values for sorting
        let valA, valB;

        if (sortConfig.key === 'status') {
            // Compute status dynamically
            const passingScore = 60;
            valA = a.avgScore >= passingScore ? 1 : 0; // Pass = 1, Fail = 0
            valB = b.avgScore >= passingScore ? 1 : 0;
        } else {
            valA = a[sortConfig.key];
            valB = b[sortConfig.key];
        }

        if (typeof valA === 'string') {
            return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
            return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }
    });

    const requestSort = key => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Detailed Analytics</h1>
                <p className="text-gray-500 text-sm sm:text-base">Deep insights into your subject performance</p>
            </div>

            {/* Subject Select */}
            <select
                className="border rounded-lg px-3 sm:px-4 py-2 w-full sm:w-auto text-sm sm:text-base"
                value={selected}
                onChange={e => setSelected(e.target.value)}
            >
                {data.subjects.map(s => (
                    <option key={s.subject} value={s.subject}>{s.subject}</option>
                ))}
            </select>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
                <StatCard title="Average Score" value={`${subject.avgScore}%`} />
                <StatCard title="Best Score" value={`${subject.bestScore}%`} />
                <StatCard title="Attempts" value={subject.attempts} />
                <StatCard title="Pass Rate" value={`${subject.passedRate}%`} />
            </div>

            {/* Score Trend */}
            <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm mt-4">
                <h3 className="font-semibold mb-4 text-sm sm:text-base">Score Trend</h3>
                <div className="h-48 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={subject.history.map((v, i) => ({ attempt: i + 1, score: v }))}>
                            <XAxis dataKey="attempt" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Table: Sortable Subjects */}



            <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm mt-4 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-6">
                <h3 className="font-semibold mb-4 text-sm sm:text-base">Subject Performance Table</h3>
                <table className="w-full table-auto border-collapse text-left min-w-[500px] text-xs sm:text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            {['subject', 'avgScore', 'bestScore', 'attempts', 'passedRate', 'status'].map(key => (
                                <th
                                    key={key}
                                    className="px-4 py-2 cursor-pointer"
                                    onClick={() => requestSort(key)}
                                >
                                    {key === 'subject' ? 'Subject' :
                                        key === 'avgScore' ? 'Average Score' :
                                            key === 'bestScore' ? 'Best Score' :
                                                key === 'attempts' ? 'Attempts' :
                                                    key === 'passedRate' ? 'Pass Rate' :
                                                        'Status'}
                                    {sortConfig.key === key ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : null}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedSubjects.map(s => {
                            const passingScore = 60;
                            const status = s.avgScore >= passingScore ? 'Pass' : 'Fail';
                            const statusColor = s.avgScore >= passingScore ? 'text-green-600' : 'text-red-600';

                            return (
                                <tr key={s.subject} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2">{s.subject}</td>
                                    <td className="px-4 py-2">{s.avgScore}%</td>
                                    <td className="px-4 py-2">{s.bestScore}%</td>
                                    <td className="px-4 py-2">{s.attempts}</td>
                                    <td className="px-4 py-2">{s.passedRate}%</td>
                                    <td className={`px-4 py-2 font-semibold ${statusColor}`}>{status}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>


            {/* Insight Box */}
            <div className="bg-indigo-50 border border-indigo-200 p-4 sm:p-6 rounded-xl mt-4">
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Insight</h4>
                <p className="text-xs sm:text-sm">
                    {subject.trend > 0 && 'Your performance is improving. Keep practicing consistently.'}
                    {subject.trend < 0 && 'Your recent performance dropped. Revise weak topics.'}
                    {subject.trend === 0 && 'Your performance is stable. Push to improve further.'}
                </p>
            </div>
        </div>
    );
};

export const StatCard = ({ title, value }) => (
    <div className="bg-white p-3 sm:p-4 rounded-xl border shadow-sm text-center">
        <p className="text-xs sm:text-sm text-gray-500">{title}</p>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-1 sm:mt-2">{value}</h3>
    </div>
);




// import React, { useEffect, useState } from 'react';
// import {
//     LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
// } from 'recharts';
// import api from '../../services/api';

// export const StudentDetailedAnalytics = () => {
//     const [data, setData] = useState(null);
//     const [selected, setSelected] = useState('');

//     useEffect(() => {
//         api.get('/student/analytics')
//             .then(res => {
//                 setData(res.data);
//                 setSelected(res.data.subjects[0]?.subject);
//             })
//             .catch(console.error);
//     }, []);

//     if (!data) return null;

//     const subject = data.subjects.find(s => s.subject === selected);

//     return (
//         <div className="p-8 space-y-8">
//             <div>
//                 <h1 className="text-3xl font-bold text-gray-900">Detailed Analytics</h1>
//                 <p className="text-gray-500">Deep insights into your subject performance</p>
//             </div>

//             <select
//                 className="border rounded-lg px-4 py-2"
//                 value={selected}
//                 onChange={e => setSelected(e.target.value)}
//             >
//                 {data.subjects.map(s => (
//                     <option key={s.subject} value={s.subject}>{s.subject}</option>
//                 ))}
//             </select>

//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
//                 <StatCard title="Average Score" value={`${subject.avgScore}%`} />
//                 <StatCard title="Best Score" value={`${subject.bestScore}%`} />
//                 <StatCard title="Attempts" value={subject.attempts} />
//                 <StatCard title="Pass Rate" value={`${subject.passedRate}%`} />
//             </div>

//             <div className="bg-white p-6 rounded-xl border shadow-sm mt-4">
//                 <h3 className="font-semibold mb-4">Score Trend</h3>
//                 <div className="h-64">
//                     <ResponsiveContainer width="100%" height="100%">
//                         <LineChart data={subject.history.map((v, i) => ({ attempt: i + 1, score: v }))}>
//                             <XAxis dataKey="attempt" />
//                             <YAxis domain={[0, 100]} />
//                             <Tooltip />
//                             <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2} />
//                         </LineChart>
//                     </ResponsiveContainer>
//                 </div>
//             </div>

//             <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl mt-4">
//                 <h4 className="font-semibold mb-2">Insight</h4>
//                 <p className="text-sm">
//                     {subject.trend > 0 && 'Your performance is improving. Keep practicing consistently.'}
//                     {subject.trend < 0 && 'Your recent performance dropped. Revise weak topics.'}
//                     {subject.trend === 0 && 'Your performance is stable. Push to improve further.'}
//                 </p>
//             </div>
//         </div>
//     );
// };

// const StatCard = ({ title, value }) => (
//     <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
//         <p className="text-sm text-gray-500">{title}</p>
//         <h3 className="text-xl font-bold text-gray-900 mt-2">{value}</h3>
//     </div>
// );
