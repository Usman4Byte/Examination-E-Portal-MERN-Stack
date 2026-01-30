import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Import models
import User from "../src/models/User.js";
import Exam from "../src/models/Exam.js";
import Category from "../src/models/Category.js";
import StudentResult from "../src/models/StudentResult.js";

const app = express();

/* MIDDLEWARE */
app.use(cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

/* DATABASE */
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        isConnected = conn.connections[0].readyState === 1;
        console.log("MongoDB Connected!");
    } catch (error) {
        console.error("MongoDB Error:", error.message);
        throw error;
    }
};

// Connect to DB middleware
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(500).json({ message: "Database connection failed" });
    }
});

/* AUTH MIDDLEWARE */
const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
        return res.status(401).json({ message: 'No token' });

    const token = header.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id).select('-password');
        if (!user) return res.status(401).json({ message: 'User not found' });
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

/* ROLE MIDDLEWARE */
const roleMiddleware = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

/* HEALTH CHECK */
app.get("/", (req, res) => {
    res.json({ message: "Exam Portal API is running" });
});

/* ============ AUTH ROUTES ============ */
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide name, email and password." });
        }
        if (!email.endsWith("@gmail.com")) {
            return res.status(400).json({ message: "Only Gmail allowed" });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, role: role || 'student' });
        await user.save();
        return res.status(201).json({ message: "Registration successful" });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Missing fields' });
        }
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email!' });
        
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(400).json({ message: 'Invalid password!' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        });

        return res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
    res.json(req.user);
});

/* ============ CATEGORY ROUTES ============ */
app.get("/api/categories", async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
});

/* ============ STUDENT ROUTES ============ */
app.get("/api/student/exams", authMiddleware, roleMiddleware(['student']), async (req, res) => {
    try {
        const exams = await Exam.find().select('-questions.correct')
            .populate('category', 'name')
            .populate('createdBy', 'name');

        const enriched = await Promise.all(exams.map(async exam => {
            const attempts = await StudentResult.find({
                exam: exam._id,
                student: req.user._id
            }).sort({ createdAt: -1 });

            let locked = false;
            let retryAfterMinutes = 0;

            if (attempts.length >= 3) {
                const lastAttempt = attempts[0];
                const diff = Date.now() - new Date(lastAttempt.createdAt);
                const cooldown = 3 * 60 * 60 * 1000;
                if (diff < cooldown) {
                    locked = true;
                    retryAfterMinutes = Math.ceil((cooldown - diff) / 60000);
                }
            }

            return {
                ...exam.toObject(),
                attemptsUsed: attempts.length,
                locked,
                retryAfterMinutes
            };
        }));

        res.json(enriched);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get("/api/student/exams/:id", authMiddleware, roleMiddleware(['student']), async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        const attempts = await StudentResult.find({
            exam: exam._id,
            student: req.user._id
        }).sort({ createdAt: -1 });

        if (attempts.length >= 3) {
            const lastAttempt = attempts[0];
            const diff = Date.now() - new Date(lastAttempt.createdAt);
            const cooldown = 3 * 60 * 60 * 1000;
            if (diff < cooldown) {
                return res.status(403).json({
                    message: `Exam locked. Retry after ${Math.ceil((cooldown - diff) / 60000)} minutes.`
                });
            }
        }

        res.json(exam);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post("/api/student/exams/:id/submit", authMiddleware, roleMiddleware(['student']), async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        const previousAttempts = await StudentResult.find({
            exam: exam._id,
            student: req.user._id
        }).sort({ createdAt: -1 });
        const attemptCount = previousAttempts.length;

        if (attemptCount >= 3) {
            const lastAttempt = previousAttempts[0];
            const now = new Date();
            const diff = now - lastAttempt.createdAt;
            if (diff < 3 * 60 * 60 * 1000) {
                return res.status(403).json({
                    message: `Maximum attempts reached. Retry after ${Math.ceil((3 * 60 * 60 * 1000 - diff) / 60000)} minutes.`
                });
            }
        }

        const { answers } = req.body;
        if (!answers) return res.status(400).json({ message: 'Answers required' });

        let score = 0;
        exam.questions.forEach((q, idx) => {
            if (answers[idx] === q.correct) score++;
        });
        const passed = (score / exam.questions.length) >= 0.6;

        const result = new StudentResult({
            student: req.user._id,
            exam: exam._id,
            answers,
            score: Math.floor((score / exam.questions.length) * 100),
            passed,
            attemptNumber: attemptCount + 1
        });
        await result.save();

        res.json({
            message: 'Exam submitted',
            attemptNumber: attemptCount + 1,
            score: result.score,
            passed,
            total: exam.questions.length,
            correct: score
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get("/api/student/results", authMiddleware, roleMiddleware(['student']), async (req, res) => {
    try {
        const results = await StudentResult.find({ student: req.user._id })
            .populate('exam', 'title duration')
            .sort({ createdAt: -1 });
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get("/api/student/results/:id", authMiddleware, roleMiddleware(['student']), async (req, res) => {
    try {
        const result = await StudentResult.findById(req.params.id)
            .populate('exam');
        if (!result) return res.status(404).json({ message: 'Result not found' });
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get("/api/student/analytics", authMiddleware, roleMiddleware(['student']), async (req, res) => {
    try {
        const results = await StudentResult.find({ student: req.user._id })
            .populate('exam', 'title category questions')
            .sort({ createdAt: -1 });

        const totalExams = results.length;
        const passed = results.filter(r => r.passed).length;
        const avgScore = totalExams > 0 
            ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalExams) 
            : 0;

        res.json({
            totalExams,
            passed,
            failed: totalExams - passed,
            avgScore,
            results
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/* ============ TEACHER ROUTES ============ */
app.get("/api/teacher/exams", authMiddleware, roleMiddleware(['teacher']), async (req, res) => {
    try {
        const exams = await Exam.find({ createdBy: req.user._id })
            .populate('category', 'name')
            .populate('createdBy', 'name');
        res.json(exams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get("/api/teacher/exams/:id", authMiddleware, roleMiddleware(['teacher']), async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('category', 'name')
            .populate('createdBy', 'name');
        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        if (exam.createdBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.json(exam);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post("/api/teacher/exams", authMiddleware, roleMiddleware(['teacher']), async (req, res) => {
    try {
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put("/api/teacher/exams/:id", authMiddleware, roleMiddleware(['teacher']), async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        if (exam.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { title, duration, questions, category } = req.body;
        exam.title = title || exam.title;
        exam.duration = duration || exam.duration;
        exam.category = category || exam.category;
        exam.questions = questions || exam.questions;
        await exam.save();
        res.json(exam);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete("/api/teacher/exams/:id", authMiddleware, roleMiddleware(['teacher']), async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        if (exam.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        await exam.deleteOne();
        res.json({ message: 'Exam deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get("/api/teacher/analytics", authMiddleware, roleMiddleware(['teacher']), async (req, res) => {
    try {
        const exams = await Exam.find({ createdBy: req.user._id });
        const examIds = exams.map(e => e._id);

        const results = await StudentResult.find({ exam: { $in: examIds } })
            .populate('student', 'name')
            .populate('exam', 'title');

        const performance = exams.map(exam => {
            const examResults = results.filter(r => r.exam._id.toString() === exam._id.toString());
            const avgScore = examResults.length
                ? Math.round(examResults.reduce((sum, r) => sum + r.score, 0) / examResults.length)
                : 0;
            return { name: exam.title, avgScore, attempts: examResults.length };
        });

        const studentIds = [...new Set(results.map(r => r.student._id.toString()))];
        const allScores = results.map(r => r.score);
        const avgScore = allScores.length
            ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
            : 0;

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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get("/api/teacher/students-analytics", authMiddleware, roleMiddleware(['teacher']), async (req, res) => {
    try {
        const exams = await Exam.find({ createdBy: req.user._id });
        const examIds = exams.map(e => e._id);

        const results = await StudentResult.find({ exam: { $in: examIds } })
            .populate('student', 'name')
            .populate('exam', 'title questions');

        const studentMap = {};
        results.forEach(r => {
            const sid = r.student._id.toString();
            if (!studentMap[sid]) {
                studentMap[sid] = {
                    id: sid,
                    name: r.student.name,
                    exams: [],
                    totalScore: 0,
                    count: 0
                };
            }
            studentMap[sid].exams.push({
                examTitle: r.exam.title,
                score: r.score,
                passed: r.passed,
                date: r.createdAt
            });
            studentMap[sid].totalScore += r.score;
            studentMap[sid].count++;
        });

        const students = Object.values(studentMap).map(s => ({
            ...s,
            avgScore: Math.round(s.totalScore / s.count)
        }));

        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default app;
