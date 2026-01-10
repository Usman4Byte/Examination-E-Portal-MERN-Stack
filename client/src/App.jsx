import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Login } from './pages/public/Login';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { CreateExam } from './pages/teacher/CreateExam';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ExamRoom } from './pages/student/ExamRoom';
import { Result } from './pages/student/Result';
import { Analytics } from './pages/teacher/Analytics';
import { Register } from './pages/public/Register';
import { DetailedAnalytics } from './pages/teacher/DetailedAnalytics';
import { StudentAnalytics } from './pages/student/StudentAnalytics';
import { StudentDetailedAnalytics } from './pages/student/StudentDetailedAnalytics';
import { ResultDetails } from './pages/student/ResultDetails';

const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" />;
    return <div className="flex min-h-screen bg-gray-50"><Sidebar /><main className="flex-1 ml-64 bg-gray-200">{children}</main></div>;
};

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/register" element={<Register />} />

                    {/* Teacher Routes */}
                    <Route path="/teacher" element={
                        <ProtectedRoute allowedRole="teacher"><TeacherDashboard /></ProtectedRoute>
                    } />
                    <Route path="/teacher/create" element={
                        <ProtectedRoute allowedRole="teacher"><CreateExam /></ProtectedRoute>
                    } />
                    <Route path="/teacher/edit/:id" element={
                        <ProtectedRoute allowedRole="teacher"><CreateExam /></ProtectedRoute>
                    } />


                    {/* Student Routes */}
                    <Route path="/student" element={
                        <ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>
                    } />
                    {/* Exam Room (No Sidebar for focus) */}
                    <Route path="/student/exam/:id" element={
                        <ProtectedRoute allowedRole="student">
                            {/* We render ExamRoom without Sidebar wrapper for focus mode */}
                            <ExamRoomWrapper />
                        </ProtectedRoute>
                    } />
                    {/* Teacher Analytics */}
                    <Route path="/teacher/analytics" element={
                        <ProtectedRoute allowedRole="teacher"><Analytics /></ProtectedRoute>
                    } />
                    <Route path="/teacher/student-analytics" element={
                        <ProtectedRoute allowedRole="teacher"><DetailedAnalytics /></ProtectedRoute>
                    } />
                    {/* Student Result */}
                    <Route path="/student/results" element={
                        <ProtectedRoute allowedRole="student"><Result /></ProtectedRoute>
                    } />

                    {/* Student Result Details */}
                    <Route path="/student/results/:id" element={
                        <ProtectedRoute allowedRole="student"><ResultDetails /></ProtectedRoute>
                    } />

                    {/* Student Analytics */}
                    <Route path="/student/analytics" element={
                        <ProtectedRoute allowedRole="student"><StudentAnalytics /></ProtectedRoute>
                    } />


                    {/* Student Detailed Analytics */}
                    <Route path="/student/analytics/details" element={
                        <ProtectedRoute allowedRole="student"><StudentDetailedAnalytics /></ProtectedRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

// Helper to remove sidebar for exam room specifically
const ExamRoomWrapper = () => {
    // This component logic would ideally verify the user is allowed to take the exam
    // For now, we just render the room.
    return <ExamRoom />;
}