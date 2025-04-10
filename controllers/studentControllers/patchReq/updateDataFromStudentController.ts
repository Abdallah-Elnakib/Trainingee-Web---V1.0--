import { Request, Response } from 'express';
import { Track } from '../../../models/tracksSchema';

export const updateDataFromStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId, field, newValue } = req.body;
        const trackName = req.params.trackName;

        if (!studentId || !field || (!newValue && newValue !== 0)) {
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

        const student = track.trackData.find((student) => student.ID === studentId);
        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }

        student[field] = newValue;
        student.TotalDegrees = student.Degrees + student.Additional;
        track.markModified('trackData');
        await track.save();

        res.status(200).json({
            message: 'Student data updated successfully',
            updatedStudent: student,
        });
    } catch (error) {
        console.error('Error updating student data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};