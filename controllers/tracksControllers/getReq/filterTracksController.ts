import { Request, Response } from 'express';
import { Track } from '../../../models/tracksSchema';

export const filterTracks = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Filter query parameters:', req.query);
        
        // Get filter parameters from query string
        const status = req.query.status as string;
        const search = req.query.search as string;
        const dateFrom = req.query.dateFrom as string;
        const dateTo = req.query.dateTo as string;
        
        // Build query object
        const query: any = {};
        
        // Add status filter if provided
        if (status && status.trim() !== '') {
            query.trackStatus = status;
        }
        
        // Add date range filters if provided
        if (dateFrom && dateFrom.trim() !== '') {
            query.trackStartDate = { $gte: new Date(dateFrom) };
        }
        
        if (dateTo && dateTo.trim() !== '') {
            query.trackEndDate = { $lte: new Date(dateTo) };
        }
        
        // Add search filter if provided (search in track name and assigned to fields)
        if (search && search.trim() !== '') {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { trackName: searchRegex },
                { trackAssignedTo: searchRegex }
            ];
        }
        
        console.log('MongoDB query:', JSON.stringify(query));
        
        // Execute query
        const tracks = await Track.find(query);
        console.log(`Found ${tracks.length} tracks matching filters`);
        
        // Process tracks to return required data
        const formattedTracks = tracks.map(track => {
            // Process track data (calculate total degrees, etc.)
            const trackData = track.trackData.map(student => {
                const totalDegrees = student.Degrees + student.Additional;
                return {
                    ...student.toObject(),
                    TotalDegrees: totalDegrees
                };
            });
            
            // Sort track data by total degrees
            trackData.sort((a, b) => b.TotalDegrees - a.TotalDegrees);
            
            // Return formatted track
            return {
                _id: track._id,
                trackName: track.trackName,
                trackStartDate: track.trackStartDate,
                trackEndDate: track.trackEndDate,
                trackStatus: track.trackStatus,
                trackAssignedTo: track.trackAssignedTo,
                trackData: trackData,
                studentNum: track.trackData.length
            };
        });
        
        // Return filtered tracks
        res.status(200).json(formattedTracks);
    } catch (error) {
        console.error('Error filtering tracks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
