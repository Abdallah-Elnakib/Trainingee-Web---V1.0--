import { Request, Response } from "express";
import { Track } from "../../../models/tracksSchema";

export const updateTrack = async (req: Request, res: Response): Promise<void> => {
    try {
        const trackName = req.params.trackName;
        const taskName = req.body.taskName;
        const taskGrade = req.body.taskGrade;
        let questionsData = req.body.questions;

        // For logging/debugging
        console.log('Received task data:', { 
            trackName, 
            taskName, 
            taskGrade, 
            questionsData 
        });

        if (!trackName) {
            res.status(400).json({ message: "Track name is required" });
            return;
        }

        if (!taskName) {
            res.status(400).json({ message: "Task name is required" });
            return;
        }

        if (taskGrade === undefined || taskGrade === null) {
            res.status(400).json({ message: "Task grade is required" });
            return;
        }

        if (questionsData === undefined || questionsData === null) {
            res.status(400).json({ message: "Questions is required" });
            return;
        }
        
        // Convert string JSON to array if it's a string
        try {
            if (typeof questionsData === 'string') {
                questionsData = JSON.parse(questionsData);
            }
        } catch (e) {
            console.error('Error parsing questions JSON:', e);
            // If parsing fails, make sure we have at least an empty array
            questionsData = [];
        }

        const track = await Track.findOne({ trackName });
        if (!track) {
            res.status(404).json({ message: "Track not found" });
            return;
        }
        if (!Array.isArray(track.trackData)) {
            res.status(500).json({ message: "Invalid track data structure" });
            return
        }

        for (const student of track.trackData) {
            if (!Array.isArray(student.BasicTotal)) {
                student.BasicTotal = [];
            }
    
            const newTask = {
                taskName: taskName,
                taskDegree: taskGrade,
                Questions: JSON.stringify(questionsData),
                studentTaskDegree: 0   
            };
            
            console.log('Adding task to student:', newTask);
            
            student.BasicTotal.push(newTask);
        }
        
        track.markModified('trackData');
        
        await track.save();
        res.status(200).json({ message: "Task added successfully" });
        return

    } catch (error) {
        res.status(500).json({ message: "Server error while updating track" });
        return
    }
}
