import { Request, Response } from 'express';
import { Track } from '../../../models/tracksSchema';

export const addNewTrack = async (req: Request, res: Response): Promise<void> => {
    try {
        const { 
            trackName,
            trackStartDate,
            trackEndDate,
            trackStatus,
            trackAssignedTo 
        } = req.body;

        // Validate required fields
        if (!trackName) {
            res.status(400).json({ message: 'Track Name is required' });
            return;
        }

        // Check if at least some basic date information is provided
        if (!trackStartDate || !trackEndDate) {
            res.status(400).json({ message: 'Start and end dates are required' });
            return;
        }

        // Validate that dates are in correct format
        const startDate = new Date(trackStartDate);
        const endDate = new Date(trackEndDate);
        
        if (startDate.toString() === 'Invalid Date' || endDate.toString() === 'Invalid Date') {
            res.status(400).json({ message: 'Invalid date format provided' });
            return;
        }

        // Check if track with same name already exists
        const existingTrack = await Track.findOne({ trackName });
        if (existingTrack) {
            res.status(409).json({ message: 'Track already exists' });
            return;
        }

        // Create a new track instance with all provided fields, using proper Date objects
        const newTrack = new Track({
            trackName,
            trackStartDate: startDate,
            trackEndDate: endDate,
            trackStatus: trackStatus || 'Pending', // Default to Pending if not provided
            trackAssignedTo: trackAssignedTo || 'Unassigned', // Default value if not provided
            trackData: [] // Initialize with empty array
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
        res.status(500).json({ 
            message: 'Internal server error',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};