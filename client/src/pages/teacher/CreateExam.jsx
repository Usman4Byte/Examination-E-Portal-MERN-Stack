import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Plus, Trash, Save } from 'lucide-react';

export const CreateExam = () => {
  const [exam, setExam] = useState({
    title: '',
    duration: 30,
    questions: [{ text: '', options: ['', '', '', ''], correct: 0 }]
  });

  const handleAddQuestion = () => {
    setExam(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', options: ['', '', '', ''], correct: 0 }]
    }));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...exam.questions];
    newQuestions[index][field] = value;
    setExam({ ...exam, questions: newQuestions });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Exam</h1>
        <Button><Save size={18} className="mr-2"/> Publish Exam</Button>
      </div>

      <div className="bg-white rounded-xl border p-6 mb-6 space-y-4">
        <input 
          placeholder="Exam Title" 
          className="text-2xl font-bold w-full border-none focus:ring-0 placeholder-gray-300 p-0"
          value={exam.title}
          onChange={e => setExam({...exam, title: e.target.value})}
        />
        <div className="flex gap-4">
          <input 
            type="number" 
            placeholder="Duration (mins)" 
            className="border p-2 rounded w-40"
            value={exam.duration}
            onChange={e => setExam({...exam, duration: parseInt(e.target.value)})}
          />
        </div>
      </div>

      <div className="space-y-6">
        {exam.questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-white rounded-xl border p-6 relative">
            <div className="absolute top-4 right-4 text-gray-300 font-bold text-4xl opacity-20">
              {qIndex + 1}
            </div>
            
            <input 
              placeholder="Type your question here..."
              className="w-full p-3 bg-gray-50 rounded-lg border mb-4 font-medium"
              value={q.text}
              onChange={e => updateQuestion(qIndex, 'text', e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name={`q-${qIndex}`}
                    checked={q.correct === oIndex}
                    onChange={() => updateQuestion(qIndex, 'correct', oIndex)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <input 
                    placeholder={`Option ${oIndex + 1}`}
                    className="flex-1 p-2 border rounded"
                    value={opt}
                    onChange={(e) => {
                      const newQuestions = [...exam.questions];
                      newQuestions[qIndex].options[oIndex] = e.target.value;
                      setExam({...exam, questions: newQuestions});
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full mt-6 py-4 border-dashed" onClick={handleAddQuestion}>
        <Plus size={20} className="mr-2"/> Add Question
      </Button>
    </div>
  );
};