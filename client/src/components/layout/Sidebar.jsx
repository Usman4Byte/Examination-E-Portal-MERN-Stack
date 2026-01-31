import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { LayoutDashboard, PlusCircle, BookOpen, LogOut, FileBarChart, Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close sidebar when screen resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
      {/* Mobile/Tablet hamburger button - fixed header bar */}
      <div className="xl:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 z-50 flex items-center px-4 shadow-lg">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="text-xl font-bold text-indigo-400 ml-3">ExamPro</h1>
        <span className="text-xs text-slate-400 ml-2 capitalize hidden sm:inline">• {user?.role} Portal</span>
      </div>

      {/* Overlay for mobile/tablet */}
      <div
        className={cn(
          "xl:hidden fixed inset-0 bg-black/50 z-30 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside className={cn(
        "w-64 sm:w-72 xl:w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col z-40 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
      )}>
        {/* Sidebar Header - hidden on mobile/tablet since we have the top bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800 mt-14 xl:mt-0">
          <h1 className="text-xl sm:text-2xl font-bold text-indigo-400 hidden xl:block">ExamPro</h1>
          <p className="text-xs text-slate-400 mt-1 capitalize">{user?.role} Portal</p>
        </div>

        <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              "flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg transition-all duration-200 text-sm sm:text-base",
              location.pathname === link.path
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white active:bg-slate-700"
            )}
          >
            <link.icon size={20} className="flex-shrink-0" />
            <span className="truncate">{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout button */}
      <div className="p-3 sm:p-4 border-t border-slate-800">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 w-full text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition-all duration-200 text-sm sm:text-base active:bg-slate-700"
        >
          <LogOut size={20} className="flex-shrink-0" /> 
          <span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
};