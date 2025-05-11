import { Request, Response } from 'express';
import { Track } from '../../../models/tracksSchema';

export const updateTrackInfo = async (req: Request, res: Response): Promise<void> => {
    try {
        const trackId = req.params.trackId;
        const { trackName, trackStartDate, trackEndDate, trackStatus, trackAssignedTo } = req.body;
        
        if (!trackId) {
            res.status(400).json({ message: 'Track ID is required' });
            return;
        }
        
        // Check if the track exists
        const existingTrack = await Track.findById(trackId);
        if (!existingTrack) {
            res.status(404).json({ message: 'Track not found' });
            return;
        }
        
        // Check if the new track name already exists (only if name is being changed)
        if (trackName && trackName !== existingTrack.trackName) {
            const trackWithSameName = await Track.findOne({ trackName });
            if (trackWithSameName && String(trackWithSameName._id) !== trackId) {
                res.status(409).json({ message: 'Track name already exists' });
                return;
            }
        }
        
        // Update track information
        const updatedTrack = await Track.findByIdAndUpdate(
            trackId,
            {
                trackName: trackName || existingTrack.trackName,
                trackStartDate: trackStartDate || existingTrack.trackStartDate,
                trackEndDate: trackEndDate || existingTrack.trackEndDate,
                trackStatus: trackStatus || existingTrack.trackStatus,
                trackAssignedTo: trackAssignedTo || existingTrack.trackAssignedTo,
            },
            { new: true }
        );
        
        if (!updatedTrack) {
            res.status(500).json({ message: 'Failed to update track' });
            return;
        }
        
        res.status(200).json({
            message: 'Track updated successfully',
            track: {
                _id: updatedTrack._id,
                trackName: updatedTrack.trackName,
                trackStartDate: updatedTrack.trackStartDate,
                trackEndDate: updatedTrack.trackEndDate,
                trackStatus: updatedTrack.trackStatus,
                trackAssignedTo: updatedTrack.trackAssignedTo,
                studentNum: updatedTrack.trackData ? updatedTrack.trackData.length : 0
            }
        });
    } catch (error) {
        console.error('Error updating track:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
