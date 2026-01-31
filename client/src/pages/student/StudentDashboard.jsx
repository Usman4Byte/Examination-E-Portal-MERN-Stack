import React from 'react';
import api from '../../services/api.js';
import { Button } from '../../components/common/Button';
import { PlayCircle, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('filter');
  const [sortBy, setSortBy] = useState('sort');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/student/exams');
        setExams(res.data);
      }
      catch (err) {
        console.error('Error fetching exams', err);
      }
    }
    fetchExams();
  }, [])


  const categories = [
    { label: 'Filter by Category', value: 'filter' },
    { label: 'ALL', value: 'all' },
    ...Array.from(
      new Set(exams.map(e => e.category?.name).filter(Boolean))
    ).map(cat => ({ label: cat, value: cat }))
  ];


  const MAX_ATTEMPTS = 3;

  const getWindowAttempts = (exam) => {
    if (!exam.locked) {
      return exam.attemptsUsed % MAX_ATTEMPTS;
    }
    return MAX_ATTEMPTS;
  };



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


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Available Exams</h1>


      {/* Options for Searching , Filtering, Sorting etc */}
      <div className="flex flex-col sm:flex-row flex-wrap w-full justify-start gap-3 sm:gap-4 lg:gap-8 px-0 py-4 sm:py-6 lg:py-8 mb-6 sm:mb-10">

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
      /* Options for Searching , Filtering, Sorting etc  */



      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredExams.map(exam => {
          const windowAttempts = getWindowAttempts(exam);
          const isMaxed = windowAttempts >= MAX_ATTEMPTS;
          return (
            <div key={exam._id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="h-2 bg-indigo-500"></div>
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-3 sm:px-4 py-3 sm:py-4'>
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full uppercase">
                  {exam.category?.name || 'General'}
                </span>


                {!isMaxed ?
                  (<span className="px-3 sm:px-4 py-1.5 sm:py-2 text-green-800 bg-green-200 text-xs sm:text-sm font-semibold rounded-full capitalize transition-all">
                    Attempts : {windowAttempts} / {MAX_ATTEMPTS}
                  </span>
                  ) :
                  (<span className="px-3 sm:px-4 py-1.5 sm:py-2 text-red-900 bg-red-200
                text-xs sm:text-sm font-semibold rounded-full capitalize transition-all">
                    Max Attempts Reached!
                  </span>
                  )}

              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{exam.title}</h3>


                <p className="text-gray-500 text-xs sm:text-sm mb-4">Duration • {exam.duration} Mins</p>

                {exam.locked ? (
                  <Button disabled className="w-full bg-indigo-500 cursor-not-allowed text-xs sm:text-sm">
                    <Lock size={16} className='mr-1 sm:mr-2 flex-shrink-0' />
                    <span className="truncate">Locked • Retry in {exam.retryAfterMinutes}m</span>
                  </Button>
                ) : (
                  <Link to={`/student/exam/${exam._id}`}>
                    <Button className="w-full text-xs sm:text-sm">
                      <PlayCircle size={16} className="mr-1 sm:mr-2 flex-shrink-0" /> Start Exam
                    </Button>
                  </Link>)}





              </div>
            </div>

          )
        })}
      </div>
    </div>
  );
};