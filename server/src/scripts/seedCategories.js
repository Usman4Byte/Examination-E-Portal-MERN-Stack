import mongoose from 'mongoose';
import Category from '../models/Category.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI;

const categories = [
    // Computer Science
    'Computer Fundamentals',
    'Programming Basics',
    'Data Structures',
    'Algorithms',
    'Object Oriented Programming',

    // Web
    'Web Development',
    'Frontend Development',
    'Backend Development',
    'Full Stack Development',
    'HTML',
    'CSS',
    'JavaScript',
    'React',
    'Angular',
    'Vue.js',
    'Node.js',
    'Express.js',

    // Mobile
    'Mobile App Development',
    'Android Development',
    'iOS Development',
    'Flutter',
    'React Native',

    // Databases
    'Databases',
    'SQL',
    'MySQL',
    'PostgreSQL',
    'MongoDB',
    'Firebase',

    // Languages
    'C Programming',
    'C++',
    'Java',
    'Python',
    'C#',
    'PHP',

    // CS Domains
    'Operating Systems',
    'Computer Networks',
    'Software Engineering',
    'Cyber Security',
    'Artificial Intelligence',
    'Machine Learning',
    'Data Science',
    'Cloud Computing',
    'DevOps'
];

(async () => {
    try {
        await mongoose.connect(MONGO_URI);
        for (const name of categories) {
            await Category.updateOne(
                { name },
                { name },
                { upsert: true }
            );
        }
        console.log('Categories seeded successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();