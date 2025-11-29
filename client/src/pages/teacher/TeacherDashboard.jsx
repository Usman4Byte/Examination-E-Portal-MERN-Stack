import React, { useState } from 'react';
import { MOCK_EXAMS } from '../../data/mockData';
import { Button } from '../../components/common/Button';
import { Clock, Users, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeacherDashboard = () => {
  const [exams, setExams] = useState(MOCK_EXAMS);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your exams and view performance</p>
        </div>
        <Link to="/teacher/create">
          <Button>+ Create New Exam</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map(exam => (
          <div key={exam.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full uppercase">
                {exam.category}
              </span>
              <span className="text-sm text-gray-400">ID: {exam.id}</span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.title}</h3>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <span className="flex items-center gap-1"><Clock size={16}/> {exam.duration}m</span>
              <span className="flex items-center gap-1"><Users size={16}/> {exam.questions.length} Qs</span>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" className="flex-1 text-xs h-9">
                <Edit size={14} className="mr-1"/> Edit
              </Button>
              <Button variant="ghost" className="text-red-500 hover:bg-red-50 h-9 w-9 p-0">
                <Trash2 size={16}/>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};