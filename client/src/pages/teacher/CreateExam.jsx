import React, { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import { Plus, Trash, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api.js';

export const CreateExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [exam, setExam] = useState({
    title: '',
    duration: 30,
    category: '',
    questions: [{ text: '', options: ['', '', '', ''], correct: 0 }],
  });





  // If editing Exisiting exam
  useEffect(() => {
    if (!id) return;
    const fetchExam = async () => {
      try {
        const res = await api.get(`/teacher/exams/${id}`);
        const examData = res.data;
        // setExam(res.data);
        setExam({
          _id: examData._id,
          title: examData.title,
          duration: examData.duration,
          category: examData.category._id, // <-- pre-select category
          questions: examData.questions || [],
          createdBy: examData.createdBy.name // optional: display teacher name if needed
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchExam();
  }, [id]);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);



  const handleAddQuestion = () => {
    setExam(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', options: ['', '', '', ''], correct: 0 }]
    }));
  };






  const handlePublish = async () => {
    // Validation
    if (!exam.title.trim()) {
      alert('Please enter an exam title');
      return;
    }
    if (!exam.category) {
      alert('Please select a category');
      return;
    }
    if (exam.questions.some(q => !q.text.trim())) {
      alert('Please fill in all question texts');
      return;
    }
    if (exam.questions.some(q => q.options.some(opt => !opt.trim()))) {
      alert('Please fill in all options for each question');
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await api.put(`/teacher/exams/${id}`, exam);
        alert('Exam updated!');
      } else {
        await api.post('/teacher/exams', exam);
        alert('Exam created!');
      }
      navigate('/teacher');
    } catch (err) {
      console.error('Publish error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to publish exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">{id ? 'Edit Exam' : 'Create New Exam'}</h1>
        <Button onClick={handlePublish} disabled={loading} className="w-full sm:w-auto">
          <Save size={18} className="mr-2" /> {loading ? 'Publishing...' : 'Publish Exam'}
        </Button>
      </div>

      <div className="bg-white rounded-xl border p-4 sm:p-6 mb-6 space-y-4">
        <input
          placeholder="Exam Title"
          className="text-xl sm:text-2xl font-bold w-full hover:outline-2 outline-indigo-500 border rounded-xl sm:rounded-2xl focus:ring-0 placeholder-gray-400 p-3 sm:p-4 transition-all-500 cursor-pointer"
          value={exam.title}
          onChange={e => setExam({ ...exam, title: e.target.value })}
        />



        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3 px-0 sm:px-4 mt-2">
          <div className="w-full sm:w-auto">
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Category</label>
            <select name="category" value={exam.category} onChange={e => setExam({ ...exam, category: e.target.value })} className="w-full sm:w-60 px-2 py-3 sm:py-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none hover:outline-indigo-500 transition:500 cursor-pointer" >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id} className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none'>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Duration(mins)</label>
            <input
              type="number"
              placeholder="Duration (mins)"
              className="w-full sm:w-60 px-2 py-3 sm:py-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 hover:outline-indigo-500 outline-none transition:500 cursor-pointer"
              value={exam.duration}
              onChange={e => setExam({ ...exam, duration: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div >

      <div className="space-y-4 sm:space-y-6">
        {exam.questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-white rounded-xl border p-4 sm:p-6 relative ">
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-300 font-bold text-2xl sm:text-4xl opacity-20 ">
              {qIndex + 1}
            </div>

            <input
              placeholder="Type your question here..."
              className="w-full p-3 sm:p-4 bg-white rounded-lg border mb-4 font-medium hover:border-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
              value={q.text}
              onChange={e => {
                const newQuestions = [...exam.questions];
                newQuestions[qIndex].text = e.target.value;
                setExam({ ...exam, questions: newQuestions });
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`q-${qIndex}`}
                    checked={q.correct === oIndex}
                    onChange={() => {
                      const newQuestions = [...exam.questions];
                      newQuestions[qIndex].correct = oIndex;
                      setExam({ ...exam, questions: newQuestions });
                    }}
                    className="w-4 h-4 text-indigo-600 hover:border-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    placeholder={`Option ${oIndex + 1}`}
                    className="flex-1 p-2 border rounded bg-white hover:border-indigo-500 focus:border-indigo-500"
                    value={opt}
                    onChange={(e) => {
                      const newQuestions = [...exam.questions];
                      newQuestions[qIndex].options[oIndex] = e.target.value;
                      setExam({ ...exam, questions: newQuestions });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full mt-6 py-4 border-dashed" onClick={handleAddQuestion}>
        <Plus size={20} className="mr-2" /> Add Question
      </Button>
    </div >
  );
};