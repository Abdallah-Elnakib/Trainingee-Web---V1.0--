import { Request, Response } from 'express';
import { getAllTracksFromDB } from '../../../utils/getAllTracksFromDB';

export const getAllTracks = async (req: Request, res: Response): Promise<void> => {
    try {
        const tracks = await getAllTracksFromDB();
        res.status(200).json(tracks);
        
    } catch (error) {
        console.error('Error fetching tracks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

