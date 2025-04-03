import  { Request, Response } from 'express';


export const forgotPasswordform = async (req: Request, res: Response): Promise<void> => {
    res.status(200).render('forgotPassword.ejs');
    return;
}