import { Request, Response } from 'express';
import {Users} from '../../../models/userModel';
import jwt from 'jsonwebtoken';
import {sendVerificationEmail}  from '../../../utils/mailesFormulas';
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        const user = await Users.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Email not found" });
            return;
        }

        const token = jwt.sign({ userId: user._id }, process.env.RESET_PASSWORD_SECRET as string, { expiresIn: '1h' });

        await Users.updateOne({ email }, { $set: { resetPasswordToken: token } });

        await sendVerificationEmail(email, token); 

        res.status(200).json({ message: "Reset password email sent successfully" });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};