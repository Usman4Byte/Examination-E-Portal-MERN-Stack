import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();

/* MIDDLEWARE */
const corsOptions = {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));
app.use(express.json());

/* DATABASE */
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log("MongoDB Connected!");
    } catch (error) {
        console.error("MongoDB Error:", error);
    }
};

// Connect to DB on each request (Vercel serverless)
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

/* ROUTES - Import inline to avoid path issues */
import authRoutes from '../src/routes/authRoutes.js';
import studentRoutes from '../src/routes/studentRoutes.js';
import teacherRoutes from '../src/routes/teacherRoutes.js';
import categoryRoutes from '../src/routes/categoryRoutes.js';

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use('/api/categories', categoryRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Exam Portal API is running" });
});

export default app;
