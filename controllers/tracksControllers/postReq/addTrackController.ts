import { Request, Response } from 'express';
import { Track } from '../../../models/tracksSchema';

export const addNewTrack = async (req: Request, res: Response): Promise<void> => {
    try {
        const { trackName} = req.body;

        // Validate required fields
        if (!trackName) {
            res.status(400).json({ message: 'Track Name is required' });
            return;
        }
        const existingTrack = await Track.findOne({ trackName });
        if (existingTrack) {
            res.status(409).json({ message: 'Track already exists' });
            return;
        }

        // Create a new track instance
        const newTrack = new Track({
            trackName,
        });

        // Save the track to the database
        const savedTrack = await newTrack.save();

        // Respond with the saved track
        res.status(201).json({
            message: 'Track added successfully',
            track: savedTrack,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};