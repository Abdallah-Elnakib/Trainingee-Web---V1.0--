import  { Request, Response } from 'express';
import { getAllTracksFromDB } from '../../../utils/getAllTracksFromDB';

export const home = async (req: Request, res: Response): Promise<void> => {
    try {
        const tracks = await getAllTracksFromDB();
        if (!tracks) {
            res.status(200).render('home.ejs', {
                user: req.user, Tracks : "No tracks"});
            return;
        }
        res.status(200).render('home.ejs', {
            user: req.user, Tracks : tracks});
        return;
    }
    catch (error) {
        console.error('Error fetching tracks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}