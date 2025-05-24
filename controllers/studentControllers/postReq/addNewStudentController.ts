import { Request, Response } from 'express';
import { addStudentSchema } from '../../../models/tracksSchema';
import { Track } from '../../../models/tracksSchema';
import  { StudentData } from '../../../models/studentSchema';


export const addNewStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { trackName, studentName } = req.body;

        if (!trackName || !studentName) {
            res.status(400).json({ message: "Track name and student name are required" });
            return;
        }

        const gitTrackFromDB = await Track.findOne({ trackName });
        if (!gitTrackFromDB) {
            res.status(404).json({ message: "Track not found" });
            return;
        }

        let spaceCount = 0;
        for (const char of studentName) {
            if (char === " ") {
                spaceCount += 1;
            }
        }

        if (spaceCount <= 2) {
            res.status(400).json({ message: "The student's full name must be entered." });
            return;
        }

        const allTracks = await Track.find();
        let existingStudentId: number | null = null;
        let studentMaxId: number = 0;

        for (const track of allTracks) {
            const existingStudent = track.trackData.find(student => student.Name === studentName);
            if (existingStudent) {
                existingStudentId = existingStudent.ID;
                break;
            }
            else {
                const maxId = track.trackData.length;
                studentMaxId += maxId
            }
        }

        const studentId = existingStudentId || (await Track.aggregate([{ $unwind: "$trackData" }, { $group: { _id: null, maxId: { $max: "$trackData.ID" } } }]).then(result => (result[0]?.maxId || 0) + 1));

        // Get tasks from the track or create default empty tasks array if none exist
        const trackData = await Track.findOne({ trackName });
        
        // Initialize tasks array
        let tasks = [];
        
        // Check if track has data and if first student has BasicTotal
        if (trackData && trackData.trackData && trackData.trackData.length > 0 && trackData.trackData[0].BasicTotal) {
            tasks = JSON.parse(JSON.stringify(trackData.trackData[0].BasicTotal)); // Deep copy to avoid reference issues
            
            // Reset all student task degrees to 0
            for (const task of tasks) {
                task.studentTaskDegree = 0;
            }
        } else {
            // If no existing tasks found, create a default empty task
            console.log('No BasicTotal found for this track, creating default empty tasks array');
            tasks = [];
        }

        const Student = {
            ID: studentId,
            Name: studentName || "Unknown",
            Degrees: 0,
            Additional: 0,
            BasicTotal: tasks,
            TotalDegrees: 0,
            Comments: "No comments",
            studentStatus : "In Progress"
        };

        const parsedStudentData = addStudentSchema.safeParse({
            Id: Student.ID,
            Name: Student.Name,
            Degrees: Student.Degrees,
            Additional: Student.Additional,
            BasicTotal: Student.BasicTotal,
            TotalDegrees: Student.TotalDegrees,
            Comments: Student.Comments,
            studentStatus : "In Progress"
        });


        if (!parsedStudentData.success) {
            res.status(400).json({ message: "Invalid student data", errors: parsedStudentData.error.errors[0] });
            return;
        }

        const studentExistsInTrack = gitTrackFromDB.trackData.some(student => student.Name === parsedStudentData.data.Name);
        if (studentExistsInTrack) {
            res.status(400).json({ message: "Student already exists in this track" });
            return;
        }

        gitTrackFromDB.trackData.push(Student);
        const updatedTrack = await gitTrackFromDB.save();
        if (!updatedTrack) {
            res.status(500).json({ message: "Failed to add student" });
            return;
        }
        
        const gitStudent = await StudentData.findOne({ Name: studentName });

        if (!gitStudent) {
            const newStudent = new StudentData({
                name : studentName,
                tracks : [trackName]
            });
            const savedStudent = await newStudent.save();
            if (!savedStudent) {
                res.status(500).json({ message: "Failed to add student" });
                return;
            }
        } else {
            await gitStudent.updateOne({ $push: { tracks: trackName } });
        }

        res.status(201).json({ message: "Student added successfully", track: updatedTrack,  studentId: studentId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};