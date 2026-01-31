import React, { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import api from '../../services/api.js';
import { Clock, Users, Edit, Trash2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';


export const TeacherDashboard = () => {
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('filter');
  const [sortBy, setSortBy] = useState('sort');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/teacher/exams');
        setExams(res.data);
      } catch (err) {
        console.error('Error fetching exams', err);
      }
    };
    fetchExams();
  }, []);



  // const categories = [
  //   'Sort by Category',
  //   'All',
  //   ...new Set(exams.map(e => e.category?.name).filter(Boolean))
  // ];

  const categories = [
    { label: 'Filter by Category', value: 'filter' },
    { label: 'ALL', value: 'all' },
    ...Array.from(
      new Set(exams.map(e => e.category?.name).filter(Boolean))
    ).map(cat => ({ label: cat, value: cat }))
  ];


  const filteredExams = exams
    .filter(exam => {
      const matchSearch =
        exam.title.toLowerCase().includes(search.toLowerCase()) ||
        exam.category?.name.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        categoryFilter === 'filter' ||        // default → no filter
        categoryFilter === 'all' ||           // show all
        exam.category?.name === categoryFilter; // specific category

      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });



  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
      await api.delete(`/teacher/exams/${id}`);
      setExams(exams.filter(exam => exam._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage your exams and view performance</p>
        </div>
        <Link to="/teacher/create">
          <Button className="w-full sm:w-auto">+ Create New Exam</Button>
        </Link>
      </div>


      {/* Options for Searching , Filtering, Sorting etc */}
      <div className="flex flex-col sm:flex-row flex-wrap w-full justify-start gap-3 sm:gap-4 lg:gap-8 px-0 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 mb-6 sm:mb-10">

        <input
          type="text"
          placeholder="Search exams..."
          className="px-4 sm:px-6 py-3 sm:py-4 border-2 rounded-lg w-full sm:w-64 lg:w-80 hover:shadow-lg drop-shadow-black bg-white focus:outline-indigo-500 placeholder:text-base sm:placeholder:text-lg placeholder:text-neutral-600 hover:border-indigo-500 transition-all"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />



        <select
          className="px-4 sm:px-6 py-3 sm:py-4 border-2 rounded-lg w-full sm:w-48 lg:w-60 hover:shadow-lg drop-shadow-black bg-white focus:outline-indigo-500 hover:border-indigo-500 transition-all"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <select
          className="px-4 sm:px-6 py-3 sm:py-4 border-2 rounded-lg w-full sm:w-48 lg:w-60 hover:shadow-lg drop-shadow-black bg-white focus:outline-indigo-500 hover:border-indigo-500 transition-all"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="sort">Sort by</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="title">Title (A–Z)</option>
        </select>
      </div>
      {/* Options for Searching , Filtering, Sorting etc  */


      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredExams.map(exam => (
          <div key={exam._id} className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
              <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full uppercase">
                {exam.category?.name || 'General'}
              </span>
              <span className="text-xs sm:text-sm text-gray-400">Created by : Mr.{exam.createdBy?.name}</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">{exam.title}</h3>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
              <span className="flex items-center gap-1"><Clock size={14} className="sm:w-4 sm:h-4" /> {exam.duration}m</span>
              <span className="flex items-center gap-1"><Users size={14} className="sm:w-4 sm:h-4" /> {exam.questions.length} Qs</span>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Link to={`/teacher/edit/${exam._id}`} className="flex-1">
                <Button variant="outline" className="w-full text-xs sm:text-sm h-9 sm:h-10">
                  <Edit size={14} className="mr-1 flex-shrink-0" /> <span className="truncate">Edit</span>
                </Button>
              </Link>
              <Button variant="ghost" className="text-red-500 hover:bg-red-50 h-9 sm:h-10 w-9 sm:w-10 p-0 flex-shrink-0" onClick={() => handleDelete(exam._id)}>
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};