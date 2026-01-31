import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { LayoutDashboard, PlusCircle, BookOpen, LogOut, FileBarChart, Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const teacherLinks = [
    { path: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/teacher/create', icon: PlusCircle, label: 'Create Exam' },
    { path: '/teacher/analytics', icon: FileBarChart, label: 'Analytics' },
  ];

  const studentLinks = [
    { path: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/student/results', icon: FileBarChart, label: 'My Results' },
    { path: '/student/analytics', icon: FileBarChart, label: 'Analytics' },
  ];

  const links = user?.role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col z-40 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-indigo-400">ExamPro</h1>
        <p className="text-xs text-slate-400 mt-1 capitalize">{user?.role} Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-12 lg:mt-0">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              location.pathname === link.path
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => { logout(); navigate('/login'); setIsOpen(false); }}
          className="flex items-center gap-3 px-4 py-2 w-full text-red-400 hover:bg-slate-800 rounded-lg"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
    </>
  );
};