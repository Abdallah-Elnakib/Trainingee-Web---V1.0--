import { Request, Response } from 'express';
import { Track } from '../../../models/tracksSchema';

export const getAllStudentsFromTrack = async (req: Request, res: Response): Promise<void> => {
    try {
        const { trackName } = req.params;
        if (!trackName) {
            res.status(400).json({ message: "Track name is required" });
            return;
        }

        const trackFromDB = await Track.findOne({ trackName });
        if (!trackFromDB) {
            res.status(404).json({ message: "Track not found" });
            return;
        }

        res.status(200).json({ students: trackFromDB.trackData });
        
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};