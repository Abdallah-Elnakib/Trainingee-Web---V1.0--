import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Users } from '../../../models/userModel';

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.query;
        
        if (!token) {
            res.status(400).render('error', { message: 'Password reset token is required' });
            return;
        }
        
        // Check if user with this token exists
        const user = await Users.findOne({ resetPasswordToken: token });
        if (!user) {
            res.status(400).render('resetPassword.ejs', { tokenError: true });
            return;
        }
        
        // Verify JWT token
        try {
            jwt.verify(token as string, process.env.RESET_PASSWORD_SECRET as string);
        } catch (error) {
            res.status(400).render('resetPassword.ejs', { tokenError: true });
            return;
        }
        
        // If all validations pass, render reset password page
        res.status(200).render('resetPassword.ejs', { tokenError: false });
        return;
    } catch (error) {
        console.error('Error in reset password GET controller:', error);
        res.status(500).render('error', { message: 'An unexpected error occurred' });
        return;
    }
}