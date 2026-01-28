import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: { type: [String], required: true },
    correct: { type: Number, required: true },
});

const ExamSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    duration: { type: Number, required: true }, // in minutes
    questions: [QuestionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // teacher id
}, { timestamps: true });

export default mongoose.model('Exam', ExamSchema);
