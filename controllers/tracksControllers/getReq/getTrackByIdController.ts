import { Request, Response } from 'express';
import { Track } from '../../../models/tracksSchema';
import mongoose from 'mongoose';

export const getTrackById = async (req: Request, res: Response): Promise<void> => {
    try {
        const trackId = req.params.trackId;
        
        if (!trackId) {
            res.status(400).json({ message: 'Track ID is required' });
            return;
        }
        
        // Validate if trackId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(trackId)) {
            console.error('Invalid track ID format:', trackId);
            res.status(400).json({ message: 'Invalid track ID format' });
            return;
        }
        
        console.log('Fetching track with ID:', trackId);
        
        const track = await Track.findById(trackId);
        
        if (!track) {
            console.error('Track not found with ID:', trackId);
            res.status(404).json({ message: 'Track not found' });
            return;
        }
        
        console.log('Track found:', track.trackName);
        
        res.status(200).json({
            message: 'Track fetched successfully',
            track: {
                _id: track._id,
                trackName: track.trackName,
                trackStartDate: track.trackStartDate,
                trackEndDate: track.trackEndDate,
                trackStatus: track.trackStatus,
                trackAssignedTo: track.trackAssignedTo,
                studentNum: track.trackData ? track.trackData.length : 0
            }
        });
    } catch (error) {
        console.error('Error fetching track by ID:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
