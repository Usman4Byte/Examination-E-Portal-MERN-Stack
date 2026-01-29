import express from 'express';
import auth from '../middleware/auth.js';
import role from '../middleware/role.js';
import Exam from '../models/Exam.js';
import StudentResult from '../models/StudentResult.js';

const router = express.Router();

// GET /api/student/exams -> List all exams
router.get('/exams', auth, role(['student']), async (req, res) => {

    const exams = await Exam.find().select('-questions.correct').
        populate('category', 'name')
        .populate('createdBy', 'name');// hide correct answers

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
});

// GET /api/student/exams/:id -> Get exam details
router.get('/exams/:id', auth, role(['student']), async (req, res) => {
    // const exam = await Exam.findById(req.params.id)
    //     .select('-questions.correct');
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
});

// POST /api/student/exams/:id/submit -> Submit answers
router.post('/exams/:id/submit', auth, role(['student']), async (req, res) => {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });



    // const attempts = await StudentResult.find({
    //     student: req.user._id,
    //     exam: exam._id,
    //     createdAt: { $gt: moment().subtract(3, 'hours').toDate() }
    // });

    // if (attempts.length >= 3)
    //     return res.status(400).json({ message: 'Maximum 3 attempts allowed in 3 hours' });

    // fetch Previous attempts
    const previousAttempts = await StudentResult.find({
        exam: exam._id,
        student: req.user._id
    }).sort({ createdAt: -1 });
    const attemptCount = previousAttempts.length;



    // Cooldown logic: 2 hours (7200000 ms)
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



    // Calculate score
    let score = 0;
    exam.questions.forEach((q, idx) => {
        if (answers[idx] === q.correct) score++;
    });
    const passed = (score / exam.questions.length) >= 0.6; // pass >= 60%


    const previousBest = await StudentResult.findOne({
        student: req.user._id,
        exam: exam._id
    }).sort({ score: -1 });


    const finalScore = previousBest ? Math.max(previousBest.score, Math.floor((score / exam.questions.length) * 100)) : Math.floor((score / exam.questions.length) * 100);



    const result = new StudentResult({
        student: req.user._id,
        exam: exam._id,
        answers,
        score: Math.floor((score / exam.questions.length) * 100), // % score
        passed,
        attemptNumber: attemptCount + 1
    });
    await result.save();

    res.json({
        message: 'Exam submitted',
        attemptNumber: attemptCount + 1,
        score: result.score, passed
    });
});

// GET /api/student/results -> List all results of the student
router.get('/results', auth, role(['student']), async (req, res) => {
    const results = await StudentResult.find({ student: req.user._id })
        .populate({
            path: 'exam',
            select: 'title duration questions'
        })
        .sort({ createdAt: -1 });

    const safeResults = results.filter(r => r.exam);

    const enriched = safeResults.map(r => {
        const answers = Object.values(r.answers || {});
        let correct = 0;

        r.exam.questions.forEach((q, idx) => {
            if (answers[idx] === q.correct) correct++;
        });

        return {
            _id: r._id,
            exam: {
                title: r.exam.title,
                totalQuestions: r.exam.questions.length
            },
            score: r.score,
            passed: r.passed,
            attemptNumber: r.attemptNumber,
            correctCount: correct,
            incorrectCount: r.exam.questions.length - correct,
            createdAt: r.createdAt
        };
    });

    res.json(enriched);
});




// GET /api/student/results/:id
router.get('/results/:id', auth, role(['student']), async (req, res) => {
    const result = await StudentResult.findById(req.params.id)
        .populate('exam', 'title questions');

    if (!result) return res.status(404).json({ message: 'Result not found' });

    const questions = result.exam.questions.map((q, idx) => ({
        text: q.text,
        options: q.options,
        correctIndex: q.correct,
        studentIndex: result.answers[idx],
        isCorrect: result.answers[idx] === q.correct
    }));

    res.json({
        examTitle: result.exam.title,
        score: result.score,
        passed: result.passed,
        attemptNumber: result.attemptNumber,
        questions
    });
});







// GET /api/student/analytics -> student analytics summary
router.get('/analytics', auth, role(['student']), async (req, res) => {
    try {

        const results = await StudentResult.find({ student: req.user._id })
            .populate({
                path: 'exam',
                populate: { path: 'category', select: 'name' },
                select: 'title category questions'
            })
            .sort({ createdAt: 1 });
        const validResults = results.filter(r => r.exam && r.exam.category);

        const subjectMap = {};

        validResults.forEach(r => {
            // Skip any corrupted result where exam is missing
            if (!r.exam) return;

            const subject = r.exam.category?.name || 'Uncategorized';

            if (!subjectMap[subject]) {
                subjectMap[subject] = {
                    subject,
                    attempts: 0,
                    scores: [],
                    bestScore: 0,
                    passed: 0
                };
            }

            subjectMap[subject].attempts += 1;
            subjectMap[subject].scores.push(r.score);
            subjectMap[subject].bestScore = Math.max(subjectMap[subject].bestScore, r.score);
            if (r.passed) subjectMap[subject].passed += 1;
        });

        const subjects = Object.values(subjectMap).map(s => {
            const avg =
                s.scores.reduce((a, b) => a + b, 0) / s.scores.length;

            const trend =
                s.scores.length >= 2
                    ? s.scores[s.scores.length - 1] - s.scores[s.scores.length - 2]
                    : 0;

            return {
                subject: s.subject,
                attempts: s.attempts,
                avgScore: Math.round(avg),
                bestScore: s.bestScore,
                passedRate: Math.round((s.passed / s.attempts) * 100),
                status: avg >= 60 ? 'PASS' : 'FAIL',
                trend,
                history: s.scores
            };
        });

        const mastery =
            subjects.length > 0
                ? Math.round(
                    subjects.reduce((a, b) => a + b.bestScore, 0) / subjects.length
                )
                : 0;

        const weakSubjects = subjects.filter(s => s.avgScore < 60);
        const strongSubjects = subjects.filter(s => s.avgScore >= 75);

        res.json({
            mastery,
            subjects,
            weakSubjects,
            strongSubjects
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Analytics error' });
    }
});





// GET / api / student / analytics / details
router.get('/analytics/details', auth, role(['student']), async (req, res) => {
    try {
        const results = await StudentResult.find({ student: req.user._id })
            .populate('exam', 'title questions')
            .sort({ createdAt: -1 });

        const valid = results.filter(r => r.exam);

        const detailed = valid.map(r => {
            const answers = Object.values(r.answers || {});
            let correct = 0;

            r.exam.questions.forEach((q, idx) => {
                if (answers[idx] === q.correct) correctCount++;
            });

            return {
                examTitle: r.exam.title,
                score: r.score,
                passed: r.passed,
                attemptNumber: r.attemptNumber,
                correctCount,
                incorrectCount: r.exam.questions.length - correctCount,
                date: r.createdAt.toLocaleString(),
                questions: r.exam.questions.map((q, idx) => ({
                    text: q.text,
                    correctOption: q.options[q.correct],
                    studentOption: q.options[r.answers[idx]],
                    isCorrect: r.answers[idx] === q.correct
                }))
            };
        });

        res.json({ detailed });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


















export default router;
