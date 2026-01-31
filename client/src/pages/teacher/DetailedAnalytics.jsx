import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';

export const DetailedAnalytics = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                const res = await api.get('/teacher/students-analytics');
                setStudents(res.data.students);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);


    const requestSort = key => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = null;
        }
        setSortConfig({ key, direction });
    };

    const filteredStudents = students.filter(student => {
        const term = search.toLowerCase();

        const nameMatch = student.name.toLowerCase().includes(term);

        const subjectMatch = student.subjects
            .join(' ')
            .toLowerCase()
            .includes(term);

        return nameMatch || subjectMatch;
    });


    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return null;
        return sortConfig.direction === 'asc' ? ' ▲' :
            sortConfig.direction === 'desc' ? ' ▼' : null;
    };


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Analytics</h1>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 text-lg font-medium">Loading student data...</p>
                </div>
            ) : (
                <>
            <input
                type="text"
                placeholder="Search student..."
                className="px-4 sm:px-6 py-3 sm:py-4 border-2 rounded-lg w-full hover:shadow-lg drop-shadow-black bg-white focus:outline-indigo-500 placeholder:text-base sm:placeholder:text-lg placeholder:text-neutral-600 hover:border-indigo-500 transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            {/* Full Student Table */}
            <div className="overflow-x-auto bg-white shadow rounded-xl border -mx-4 sm:mx-0">
                <table className="min-w-full divide-y divide-gray-400 drop-shadow-lg">
                    <thead className="bg-indigo-500 text-white text-center">
                        <tr>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium uppercase cursor-pointer whitespace-nowrap" onClick={() => requestSort('name')}>Student Name<SortIcon column="name" /></th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium uppercase cursor-pointer whitespace-nowrap" onClick={() => requestSort('totalAttempts')}>Attempts<SortIcon column="totalAttempts" /></th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium uppercase cursor-pointer whitespace-nowrap" onClick={() => requestSort('highestScore')}>Highest<SortIcon column="highestScore" /></th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium uppercase cursor-pointer whitespace-nowrap" onClick={() => requestSort('lowestScore')}>Lowest<SortIcon column="lowestScore" /></th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium uppercase cursor-pointer whitespace-nowrap" onClick={() => requestSort('totalCorrect')}>Correct<SortIcon column="totalCorrect" /></th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium uppercase cursor-pointer whitespace-nowrap" onClick={() => requestSort('totalIncorrect')}>Incorrect<SortIcon column="totalIncorrect" /></th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium uppercase cursor-pointer whitespace-nowrap" onClick={() => requestSort('subjects')}>Subjects<SortIcon column="subjects" /></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-center divide-gray-400 text-sm sm:text-base">
                        {filteredStudents.map(student => (
                            <tr
                                key={student.studentId}
                                className="hover:bg-indigo-500 hover:text-white cursor-pointer transition-colors"
                                onClick={() => setSelectedStudent(student)}
                            >
                                <td className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap">{student.name}</td>
                                <td className="px-3 sm:px-6 py-3 sm:py-5">{student.totalAttempts}</td>
                                <td className="px-3 sm:px-6 py-3 sm:py-5">{student.highestScore}</td>
                                <td className="px-3 sm:px-6 py-3 sm:py-5">{student.lowestScore}</td>
                                <td className="px-3 sm:px-6 py-3 sm:py-5">{student.totalCorrect}</td>
                                <td className="px-3 sm:px-6 py-3 sm:py-5">{student.totalIncorrect}</td>
                                <td className="px-3 sm:px-6 py-3 sm:py-5">{student.subjects.join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Selected Student Details */}
            {selectedStudent && (
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow border mt-6 sm:mt-8">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4">{selectedStudent.name}'s Exam History</h2>
                    {selectedStudent.exams.map(exam => (
                        <div key={exam.examId} className="mb-4 sm:mb-6 border-b pb-4">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{exam.title}</h3>
                            <p className="text-sm sm:text-base">Score: {exam.score}%</p>
                            <p className="text-sm sm:text-base">Correct: {exam.correctCount} | Incorrect: {exam.incorrectCount}</p>

                            {/* Question Details */}
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <table className="w-full mt-2 text-xs sm:text-sm border rounded min-w-[500px]">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-2 py-1">#</th>
                                        <th className="px-2 py-1">Question</th>
                                        <th className="px-2 py-1">Correct</th>
                                        <th className="px-2 py-1">Student</th>
                                        <th className="px-2 py-1">Result</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exam.questions.map((q, idx) => {
                                        const studentAnswer = exam.answers[idx];
                                        const isCorrect = studentAnswer === q.correct;
                                        return (
                                            <tr key={idx} className={isCorrect ? 'bg-emerald-50' : 'bg-red-50'}>
                                                <td className="px-2 py-1">{idx + 1}</td>
                                                <td className="px-2 py-1">{q.text}</td>
                                                <td className="px-2 py-1">{q.options[q.correct]}</td>
                                                <td className="px-2 py-1">{q.options[studentAnswer]}</td>
                                                <td className="px-2 py-1">{isCorrect ? 'Correct' : 'Incorrect'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
                </>
            )}
        </div>
    );
};
