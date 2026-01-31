import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

import connectDB from "./config/db.js";

dotenv.config();

const app = express();


/* MIDDLEWARE */
const corsOptions = {
    origin: true,  // Allow all origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));
app.use(express.json());      // Allow JSON data in requests

/* DATABASE */
connectDB();

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use('/api/categories', categoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});