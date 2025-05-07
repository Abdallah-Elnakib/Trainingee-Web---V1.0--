import { Request, Response } from "express";
import { Track } from "../../../models/tracksSchema";

export const getStudentTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        const { trackName, studentId } = req.params;
        
        if (!trackName) {
            res.status(400).json({ message: "Track name is required" });
            return;
        }
        
        if (!studentId || isNaN(Number(studentId))) {
            res.status(400).json({ message: "Valid student ID is required" });
            return;
        }
        
        const track = await Track.findOne({ trackName });
        if (!track) {
            res.status(404).json({ message: "Track not found" });
            return;
        }
        
        if (!Array.isArray(track.trackData)) {
            res.status(500).json({ message: "Invalid track data structure" });
            return;
        }
        
        // Find the student in the track data
        const student = track.trackData.find(s => s.ID === Number(studentId));
        if (!student) {
            res.status(404).json({ message: "Student not found in this track" });
            return;
        }
        
        // Return the student data with their tasks
        res.status(200).json({ 
            student: student
        });
        
    } catch (error) {
        res.status(500).json({ message: "Server error while retrieving student tasks" });
    }
};
