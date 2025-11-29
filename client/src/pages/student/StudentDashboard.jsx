import React from 'react';
import { MOCK_EXAMS } from '../../data/mockData';
import { Button } from '../../components/common/Button';
import { PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Exams</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_EXAMS.map(exam => (
          <div key={exam.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="h-2 bg-indigo-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.title}</h3>
              <p className="text-gray-500 text-sm mb-4">{exam.category} • {exam.duration} Mins</p>
              
              <Link to={`/student/exam/${exam.id}`}>
                <Button className="w-full">
                  <PlayCircle size={18} className="mr-2"/> Start Exam
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};