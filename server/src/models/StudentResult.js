import mongoose from 'mongoose';

const StudentResultSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    answers: { type: Object, required: true }, // { "0": 2, "1": 1, ... }
    score: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    attemptNumber: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('StudentResult', StudentResultSchema);
