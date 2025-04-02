import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Users } from '../models/userModel';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }

        const user = await Users.findOne({ email });
        
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid password' });
            return;
        }

        const ACCESS_TOKEN = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.ACCESS_TOKEN_SECRET as string, 
            { expiresIn: "15m" }
        );
                
        const REFRESH_TOKEN = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.REFRESH_TOKEN_SECRET as string, 
            { expiresIn: "7d" }
        );
        
        req.session.refreshToken = REFRESH_TOKEN;

        res.status(201).json({ 
            ACCESS_TOKEN,
            REFRESH_TOKEN,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
        return;

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};