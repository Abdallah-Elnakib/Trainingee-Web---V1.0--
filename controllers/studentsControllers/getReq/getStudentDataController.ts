import { Request, Response } from 'express';
import { Track } from '../../../models/tracksSchema';
import { StudentData } from '../../../models/studentSchema';

export const getStudentData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId } = req.params;
        
        // Get student basic info
        const student = await StudentData.findById(studentId);
        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }

        console.log('Found student:', student);
        
        // Get tracks data for this student
        const studentTracks = student.tracks || [];
        console.log('Student tracks:', studentTracks);
        
        const trackDataPromises = studentTracks.map(async (trackName: string) => {
            console.log('Processing track:', trackName);
            const track = await Track.findOne({ trackName });
            if (!track) {
                console.log('Track not found:', trackName);
                return null;
            }
            
            // Find student in track data by name instead of comparing name to itself
            const studentData = track.trackData.find((std: any) => std.Name === student.name);
            if (!studentData) {
                console.log('Student not found in track:', trackName);
                return null;
            }
            
            console.log('Found student in track:', studentData.ID, studentData.Name);
            
            return {
                trackName,
                status: studentData.studentStatus || 'Pending',
                degrees: studentData.Degrees || 0,
                totalDegrees: studentData.TotalDegrees || 0,
                tasks: studentData.BasicTotal || [],
                comments: studentData.Comments || 'No comments',
                // Include the student ID from the track data, which is consistent across tracks
                studentTrackId: studentData.ID
            };
        });
        
        const tracksData = (await Promise.all(trackDataPromises)).filter(track => track !== null);
        console.log('Tracks data length:', tracksData.length);
        
        // Find the student ID from track data if available
        const studentTrackId = tracksData.length > 0 ? tracksData[0].studentTrackId : null;
        
        res.status(200).json({
            student: {
                id: studentTrackId || student._id,
                name: student.name,
                username: student.username,
                tracks: student.tracks
            },
            tracksData
        });
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
