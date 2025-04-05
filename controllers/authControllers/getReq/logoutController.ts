import { Request, Response } from 'express';


export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie('connect.sid');
        res.status(200).render('login.ejs', { message: "Logged out successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}