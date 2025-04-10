import e, { Request, Response } from 'express';
import { Track } from '../../../models/tracksSchema';


export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId } = req.body;
        const trackName = req.params.trackName;

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

        track.trackData.splice(studentIndex, 1);
        track.markModified('trackData');
        await track.save();

        res.status(200).json({
            message: 'Student deleted successfully',
            updatedTrack: track,
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};