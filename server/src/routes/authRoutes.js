import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth.js';
import 'dotenv/config';




/* ================= REGISTER ================= */

router.post("/register", async (req, res) => {

    try {


        const { name, email, password, role } = req.body;

        /* VALIDATION */
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide name, email and password." });
        }

        if (!email.endsWith("@gmail.com")) {
            return res.status(400).json({ message: "Only Gmail allowed" });
        }

        /* CHECK EXISTING USER */

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        /* HASH PASSWORD */
        const hashedPassword = await bcrypt.hash(password, 10);


        /* SAVE USER */
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'student'
        });

        await user.save();

        console.log(`User Registered with following details:
            Name: ${user.name}
            Email: ${user.email}
            Role: ${user.role}`);

        return res.status(201).json({
            message: "Registration successful"
        });



    }
    catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
})


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        const user = await User.findOne({ email });
        if (!user) { return res.status(400).json({ message: 'Invalid email!' }) };


        const ok = await bcrypt.compare(password, user.password);
        if (!ok) { return res.status(400).json({ message: 'Invalid password!' }) };

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });


        console.log(`User Logged in with details:
            Id: ${user._id}
             Name: ${user.name}
            Email: ${user.email}
            Role: ${user.role}
            `);

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

})

// get current logged-in user
router.get('/me', auth, (req, res) => {
    res.json(req.user);
});

export default router