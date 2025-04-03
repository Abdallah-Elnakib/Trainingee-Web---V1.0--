import  { Request, Response } from 'express';


export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    res.status(200).render('resetPassword.ejs');
    return;
}