import { Request, Response } from 'express';

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }
        res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};