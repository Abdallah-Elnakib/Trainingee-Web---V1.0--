import  { Request, Response } from 'express';
import { Track } from '../../../models/tracksSchema';
import  { StudentData } from '../../../models/studentSchema';

export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const trackName = req.params.trackName;
        const studentId = Number(req.params.studentId);

        if (!studentId) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        if (!trackName) {
            res.status(400).json({ message: 'Missing track name' });
            return;
        }

        const track = await Track.findOne({ trackName });
        if (!track) {
            res.status(404).json({ message: 'Track not found' });
            return;
        }

        const studentIndex = track.trackData.findIndex((student) => student.ID === studentId);
        if (studentIndex === -1) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        
        // Save the student name before removing from array
        const studentName = track.trackData[studentIndex].Name;
        console.log('Deleting student:', studentName, 'with ID:', studentId, 'from track:', trackName);
        
        // Remove student from track
        track.trackData.splice(studentIndex, 1);
        track.markModified('trackData');
        await track.save();
        
        // Now remove track from student's list of tracks
        const deletedTrack = await StudentData.findOneAndUpdate(
            { name: studentName }, 
            { $pull: { tracks: trackName } }
        );

        if (!deletedTrack) {
            res.status(404).json({ message: 'Track not found' });
            return;
        }

        res.status(200).json({
            message: 'Student deleted successfully',
            updatedTrack: track,
            deletedTrack
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};