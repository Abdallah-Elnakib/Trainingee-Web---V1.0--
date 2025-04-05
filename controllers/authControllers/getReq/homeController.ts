import  { Request, Response } from 'express';

export const home = async (req: Request, res: Response): Promise<void> => {
    res.status(200).render('home.ejs', {
        user: req.user,});
    return;
}