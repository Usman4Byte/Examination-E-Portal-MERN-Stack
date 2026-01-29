import express from 'express';
import Category from '../models/Category.js';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
});
export default router;
