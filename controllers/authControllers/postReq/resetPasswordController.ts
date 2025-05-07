import e, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Users } from '../../../models/userModel';

export const resetPasswordInDatabase = async (req: Request, res: Response) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        const { token } = req.query;
        if (!newPassword || !confirmPassword) {
            res.status(400).json({ message: 'New password and confirm password are required' });
            return;
        }
        if (newPassword !== confirmPassword) {
            res.status(400).json({ message: 'Passwords do not match' });
            return;
        }

        if (newPassword.length < 8) {
            res.status(400).json({ message: 'Password must be at least 8 characters' });
            return;
        }

        const user = await Users.findOne({ resetPasswordToken: token });
        if (!user) {
            res.status(400).json({ message: 'Invalid token' });
            return;
        }
        jwt.verify(token as string, process.env.RESET_PASSWORD_SECRET as string, (err, decoded) => {
            if (err) {
                res.status(400).json({ message: 'Invalid token' });
                return;
            }
        });

        const hashedPassword = await bcrypt.hash(newPassword+process.env.SOLT, 10);

        await Users.updateOne({ _id: user._id }, { $set: { password: hashedPassword, resetPasswordToken: null } });

        res.status(200).json({ message: 'Password reset successfully' });

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};