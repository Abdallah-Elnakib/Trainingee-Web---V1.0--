import { Request, Response } from 'express';
import { StudentData } from '../../../models/studentSchema';
import jwt from 'jsonwebtoken';

export const studentLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }

        const student = await StudentData.findOne({ username });
        
        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }

        // Simple password check (consider using bcrypt for production)
        if (student.password !== password) {
            res.status(401).json({ message: 'Invalid password' });
            return;
        }

        const ACCESS_TOKEN = jwt.sign(
            { 
                studentId: student._id, 
                role: 'student', 
                name: student.name, 
                username: student.username
            }, 
            process.env.ACCESS_TOKEN_SECRET as string, 
            { expiresIn: "15m" }
        );
                
        const REFRESH_TOKEN = jwt.sign(
            { 
                studentId: student._id, 
                role: 'student', 
                name: student.name, 
                username: student.username
            }, 
            process.env.REFRESH_TOKEN_SECRET as string, 
            { expiresIn: "1d" }
        );
        
        req.session.refreshToken = REFRESH_TOKEN;

        res.status(200).json({ 
            ACCESS_TOKEN,
            REFRESH_TOKEN,
            user: {
                id: student._id,
                name: student.name,
                username: student.username,
                role: 'student',
                tracks: student.tracks
            }
        });
        return;
    } catch (error) {
        console.error('Error during student login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
