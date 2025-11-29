export const MOCK_USERS = [
  { id: '1', name: 'Teacher Demo', email: 'teacher@demo.com', password: '123', role: 'teacher' },
  { id: '2', name: 'Student Demo', email: 'student@demo.com', password: '123', role: 'student' }
];

export const MOCK_EXAMS = [
  {
    id: 'exam_1',
    title: 'React.js Fundamentals',
    category: 'Development',
    duration: 15,
    status: 'published',
    questions: [
      { id: 1, text: 'What is a Hook?', options: ['Function', 'Class', 'Variable', 'Array'], correct: 0 },
      { id: 2, text: 'JSX stands for?', options: ['Java XML', 'JavaScript XML', 'JSON X', 'None'], correct: 1 }
    ]
  }
];