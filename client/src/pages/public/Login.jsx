import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../../components/common/Button.jsx';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      navigate(user.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      setError(err.message);
      console.log('Login Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl w-full max-w-[95%] sm:max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Welcome Back</h2>

        {error && <div className="bg-red-50 text-red-600 p-2.5 sm:p-3 rounded-lg mb-3 sm:mb-4 text-xs sm:text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base transition-shadow"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base transition-shadow"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <Button type="submit" className="w-full py-2.5 sm:py-3" isLoading={isLoading}>Sign In</Button>
        </form>

        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>


      </div>
    </div>
  );
};