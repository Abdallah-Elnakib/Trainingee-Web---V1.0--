import { Request, Response } from 'express';
import { Track } from '../../../models/tracksSchema';

// Ampliar la interfaz Request para incluir las propiedades que añade el middleware verifyJWT
declare module 'express-serve-static-core' {
    interface Request {
        userId?: string;
        userName?: string;
    }
}


export const studentsPage = async (req: Request, res: Response) => {
    try {
        // Get all tracks for filter dropdown
        const tracks = await Track.find({}, { trackName: 1, _id: 1 });
        
        res.render('students', { 
            Tracks: tracks,
            page: 'students',
            searchQuery: '',
            filterTrack: '',
            filterStatus: '',
            userId: req.userId,
            userName: req.userName
        });
    } catch (error) {
        console.error('Error loading students page:', error);
        res.status(500).render('students', { 
            error: 'Could not load students page. Please try again later.',
            Tracks: [],
            page: 'students',
            userId: req.userId,
            userName: req.userName
        });
    }
};
