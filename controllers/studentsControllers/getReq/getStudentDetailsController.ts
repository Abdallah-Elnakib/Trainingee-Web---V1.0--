import { Request, Response } from 'express';
import { Track } from '../../../models/tracksSchema';


export const getStudentDetails = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        
        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: 'Student ID is required'
            });
        }
        
        const tracks = await Track.find({ 'trackData.Id': parseInt(studentId) });
        
        if (!tracks || tracks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        const studentDetails: any = {
            studentInfo: null,
            tracks: []
        };
        
        tracks.forEach(track => {
            if (!track.trackData || !Array.isArray(track.trackData)) {
                return;
            }
            
            const studentInTrack = track.trackData.find(
                (student: any) => student.Id === parseInt(studentId)
            );
            
            if (!studentInTrack) {
                return;
            }
            
            if (!studentDetails.studentInfo) {
                studentDetails.studentInfo = {
                    id: studentInTrack.Id,
                    name: studentInTrack.Name,
                };
            }
            
            studentDetails.tracks.push({
                trackId: track._id,
                trackName: track.trackName,
                trackStartDate: track.trackStartDate,
                trackEndDate: track.trackEndDate, 
                trackStatus: track.trackStatus,
                studentData: {
                    status: studentInTrack.studentStatus,
                    degrees: studentInTrack.Degrees,
                    additional: studentInTrack.Additional,
                    totalDegrees: studentInTrack.TotalDegrees,
                    comments: studentInTrack.Comments,
                    tasks: studentInTrack.BasicTotal || []
                }
            });
        });
        
        return res.status(200).json({
            success: true,
            studentDetails
        });
    } catch (error) {
        console.error('Error getting student details:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not retrieve student details. Please try again later.'
        });
    }
};
