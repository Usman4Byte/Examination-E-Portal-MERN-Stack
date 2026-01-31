import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "../src/routes/authRoutes.js";
import studentRoutes from "../src/routes/StudentRoutes.js";
import teacherRoutes from "../src/routes/teacherRoutes.js";
import categoryRoutes from "../src/routes/categoryRoutes.js";
import connectDB from "../src/config/db.js";

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
connectDB();

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/categories", categoryRoutes);

/* Health check */
app.get("/", (req, res) => {
    res.json({ message: "E-Portal Exam API is running" });
});

app.get("/api", (req, res) => {
    res.json({ message: "E-Portal Exam API is running" });
});

/* Export for Vercel serverless */
export default app;
