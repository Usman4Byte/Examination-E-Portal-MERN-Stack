import express from 'express';
import auth from '../middleware/auth.js';
import role from '../middleware/role.js';
import Exam from '../models/Exam.js';
import StudentResult from '../models/StudentResult.js';

const router = express.Router();

// GET /api/teacher/exams -> list exams created by this teacher
router.get('/exams', auth, role(['teacher']), async (req, res) => {
    const exams = await Exam.find({ createdBy: req.user._id })
        .populate('category', 'name')
        .populate('createdBy', 'name');
    res.json(exams);
});

// POST /api/teacher/exams -> create new exam
router.post('/exams', auth, role(['teacher']), async (req, res) => {
    const { title, duration, questions, category } = req.body;
    if (!category) return res.status(400).json({ message: 'Category is required' });
    const exam = new Exam({
        title,
        duration,
        questions,
        category,
        createdBy: req.user._id
    });
    await exam.save();
    res.status(201).json(exam);
});

// PUT /api/teacher/exams/:id -> update exam
router.put('/exams/:id', auth, role(['teacher']), async (req, res) => {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    if (exam.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });

    const { title, duration, questions, category } = req.body;
    exam.title = title || exam.title;
    exam.duration = duration || exam.duration;
    exam.category = category || exam.category;
    exam.questions = questions || exam.questions;
    await exam.save();
    res.json(exam);
});


router.get('/exams/:id', auth, role(['teacher']), async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('category', 'name')   // populate category name
            .populate('createdBy', 'name'); // populate teacher name

        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        // Ensure the logged-in teacher owns this exam
        if (exam.createdBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(exam);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/teacher/exams/:id -> delete exam
router.delete('/exams/:id', auth, role(['teacher']), async (req, res) => {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    if (exam.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    await exam.deleteOne();
    res.json({ message: 'Exam deleted' });
});

// GET /api/teacher/analytics -> aggregated stats
router.get('/analytics', auth, role(['teacher']), async (req, res) => {
    try {
        const exams = await Exam.find({ createdBy: req.user._id });
        const examIds = exams.map(e => e._id);

        const results = await StudentResult.find({ exam: { $in: examIds } })
            .populate('student', 'name')
            .populate('exam', 'title');

        // Performance per exam
        const performance = exams.map(exam => {
            const examResults = results.filter(r => r.exam._id.toString() === exam._id.toString());
            const avgScore = examResults.length
                ? Math.round(examResults.reduce((sum, r) => sum + r.score, 0) / examResults.length)
                : 0;
            return {
                name: exam.title,
                avgScore,
                attempts: examResults.length
            };
        });

        // Unique students
        const studentIds = [...new Set(results.map(r => r.student._id.toString()))];

        // Average class score across all exams
        const allScores = results.map(r => r.score);
        const avgScore = allScores.length
            ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
            : 0;

        // Recent submissions
        const recent = results
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 10)
            .map(r => ({
                student: r.student.name,
                exam: r.exam.title,
                score: r.score,
                date: r.createdAt.toLocaleString()
            }));

        res.json({
            totalExams: exams.length,
            avgScore,
            activeStudents: studentIds.length,
            performance,
            recent
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});




// GET /api/teacher/students-analytics -> full student analytics
router.get('/students-analytics', auth, role(['teacher']), async (req, res) => {
    try {
        const exams = await Exam.find({ createdBy: req.user._id });
        const examIds = exams.map(e => e._id);

        const results = await StudentResult.find({ exam: { $in: examIds } })
            .populate('student', 'name')
            .populate('exam', 'title questions'); // include questions

        // Group results by student
        const studentMap = {};
        results.forEach(r => {
            const sid = r.student._id.toString();
            if (!studentMap[sid]) {
                studentMap[sid] = {
                    studentId: sid,
                    name: r.student.name,
                    exams: [],
                    totalAttempts: 0,
                    highestScore: 0,
                    lowestScore: 100,
                    totalCorrect: 0,
                    totalIncorrect: 0,
                    subjects: new Set()
                };
            }
            const correctCount = Object.keys(r.answers).reduce((acc, idx) => {
                return r.answers[idx] === r.exam.questions[idx].correct ? acc + 1 : acc;
            }, 0);
            const incorrectCount = r.exam.questions.length - correctCount;

            studentMap[sid].exams.push({
                examId: r.exam._id,
                title: r.exam.title,
                score: r.score,
                correctCount,
                incorrectCount,
                answers: r.answers,
                questions: r.exam.questions
            });

            studentMap[sid].totalAttempts += 1;
            studentMap[sid].highestScore = Math.max(studentMap[sid].highestScore, r.score);
            studentMap[sid].lowestScore = Math.min(studentMap[sid].lowestScore, r.score);
            studentMap[sid].totalCorrect += correctCount;
            studentMap[sid].totalIncorrect += incorrectCount;
            studentMap[sid].subjects.add(r.exam.title);
        });

        const students = Object.values(studentMap).map(s => ({
            ...s,
            subjects: Array.from(s.subjects) // convert Set to Array
        }));

        res.json({ students });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


export default router;
