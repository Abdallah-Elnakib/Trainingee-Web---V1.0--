import  { Request, Response } from 'express';


export const loginForm = async (req: Request, res: Response): Promise<void> => {
    res.status(200).render('login.ejs');
    return;
}