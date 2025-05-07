import { Request, Response } from "express";
import { Track } from "../../../models/tracksSchema";

// Define interfaces for task data
interface TaskUpdate {
    index: number;
    taskName: string;
    studentTaskDegree: number;
}

export const updateStudentTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        const { trackName, studentId } = req.params;
        const { tasks } = req.body;
        
        if (!trackName) {
            res.status(400).json({ message: "Track name is required" });
            return;
        }
        
        if (!studentId || isNaN(Number(studentId))) {
            res.status(400).json({ message: "Valid student ID is required" });
            return;
        }
        
        if (!Array.isArray(tasks)) {
            res.status(400).json({ message: "Tasks must be an array" });
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
        
        const studentIndex = track.trackData.findIndex(s => s.ID === Number(studentId));
        if (studentIndex === -1) {
            res.status(404).json({ message: "Student not found in this track" });
            return;
        }
        
        const student = track.trackData[studentIndex];
        if (!Array.isArray(student.BasicTotal)) {
            student.BasicTotal = [];
        }
        
        let totalStudentTaskGrades = 0;
        
        tasks.forEach((updatedTask: TaskUpdate) => {
            if (updatedTask.index >= 0 && updatedTask.index < student.BasicTotal.length) {
                // Get the maximum possible grade for this task
                const maxGrade = student.BasicTotal[updatedTask.index].taskDegree;
                
                // Ensure the student's grade doesn't exceed the maximum
                const validatedGrade = Math.min(updatedTask.studentTaskDegree, maxGrade);
                
                // Update the student's grade for this task
                student.BasicTotal[updatedTask.index].studentTaskDegree = validatedGrade;
            }
        });
        
        student.BasicTotal.forEach((task: { taskName: string; taskDegree: number; studentTaskDegree: number }) => {
            totalStudentTaskGrades += task.studentTaskDegree || 0;
        });
        
        student.Degrees = totalStudentTaskGrades;
        
        track.markModified('trackData');
        
        await track.save();
        
        res.status(200).json({ 
            message: "Tasks updated successfully",
            degrees: student.Degrees,
            totalStudentTaskGrades: totalStudentTaskGrades
        });
        
    } catch (error) {
        res.status(500).json({ message: "Server error while updating student tasks" });
    }
};
