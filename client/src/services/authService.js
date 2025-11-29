import { MOCK_USERS } from '../data/mockData.js';

// Simulating an API call with a 500ms delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const loginAPI = async (email, password) => {
  await delay(800);
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Invalid credentials');
  
  // In real MERN, this returns a JWT token. We mock it here.
  return { ...user, token: 'mock-jwt-token-123' };
};

export const registerAPI = async (userData) => {
  await delay(800);
  // Real backend would save to MongoDB here
  return { ...userData, id: Math.random().toString(), role: 'student' };
};