import { Request, Response } from 'express';
import { userSchema } from '../../../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Users } from '../../../models/userModel';


declare module 'express-session' {
  interface SessionData {
    refreshToken: string;
  }
}

export const signup = async (req: Request, res: Response): Promise<void>  => {
    try {
        const validation = userSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ 
                message: "Validation error",
                errors: validation.error.issues 
            });
            return;
        }

        const { firstName, lastName, username, email, password, role } = req.body;

        const existingUser = await Users.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            res.status(409).json({ 
                message: "User with this email or username already exists" 
            });
            return;
        }

        if (password.length < 8) {
            res.status(400).json({ 
                message: "Password must be at least 8 characters" 
            });
            return;
        }

        const hashPassword = await bcrypt.hash(password + process.env.SOLT, 10);

        const user = new Users({
            firstName,
            lastName,
            username,
            email,
            password: hashPassword,
            role: role || 'user', 
        });

        await user.save();

        const ACCESS_TOKEN = jwt.sign(
            { userId: user._id, role: user.role ,firstName: user.firstName, lastName: user.lastName}, 
            process.env.ACCESS_TOKEN_SECRET as string, 
            { expiresIn: "15m" }
        );
        
        const REFRESH_TOKEN = jwt.sign(
            { userId: user._id, role: user.role , firstName: user.firstName, lastName: user.lastName}, 
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
        console.error('Signup error:', error);
        res.status(500).json({ 
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
        return;
    }
}