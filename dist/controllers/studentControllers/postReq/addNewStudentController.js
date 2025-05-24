"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNewStudent = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
const tracksSchema_2 = require("../../../models/tracksSchema");
const studentSchema_1 = require("../../../models/studentSchema");
const addNewStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { trackName, studentName } = req.body;
        if (!trackName || !studentName) {
            res.status(400).json({ message: "Track name and student name are required" });
            return;
        }
        const gitTrackFromDB = yield tracksSchema_2.Track.findOne({ trackName });
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
        const allTracks = yield tracksSchema_2.Track.find();
        let existingStudentId = null;
        let studentMaxId = 0;
        for (const track of allTracks) {
            const existingStudent = track.trackData.find(student => student.Name === studentName);
            if (existingStudent) {
                existingStudentId = existingStudent.ID;
                break;
            }
            else {
                const maxId = track.trackData.length;
                studentMaxId += maxId;
            }
        }
        const studentId = existingStudentId || (yield tracksSchema_2.Track.aggregate([{ $unwind: "$trackData" }, { $group: { _id: null, maxId: { $max: "$trackData.ID" } } }]).then(result => { var _a; return (((_a = result[0]) === null || _a === void 0 ? void 0 : _a.maxId) || 0) + 1; }));
        // Get tasks from the track or create default empty tasks array if none exist
        const trackData = yield tracksSchema_2.Track.findOne({ trackName });
        // Initialize tasks array
        let tasks = [];
        // Check if track has data and if first student has BasicTotal
        if (trackData && trackData.trackData && trackData.trackData.length > 0 && trackData.trackData[0].BasicTotal) {
            tasks = JSON.parse(JSON.stringify(trackData.trackData[0].BasicTotal)); // Deep copy to avoid reference issues
            // Reset all student task degrees to 0 and ensure Questions field is properly set
            for (const task of tasks) {
                task.studentTaskDegree = 0;
                // Ensure Questions field exists and is a string as per updated schema
                if (task.Questions === undefined || task.Questions === null) {
                    // If no questions data, set it as an empty array string
                    task.Questions = JSON.stringify([]);
                }
                else if (typeof task.Questions === 'number') {
                    // If it's still a number from old format, convert to empty array string
                    task.Questions = JSON.stringify([]);
                }
                else if (typeof task.Questions !== 'string') {
                    // Ensure it's a string
                    task.Questions = JSON.stringify(task.Questions);
                }
            }
        }
        else {
            // If no existing tasks found, create a default empty task array
            console.log('No BasicTotal found for this track, creating default empty tasks array');
            tasks = [];
            // If there's track data but no tasks, we might need to create a default task
            // This helps avoid validation errors when no tasks exist at all
            if (trackData && trackData.trackData && trackData.trackData.length > 0) {
                console.log('Track exists but has no tasks, adding a default empty task');
                tasks.push({
                    taskName: 'Default Task',
                    taskDegree: 0,
                    Questions: JSON.stringify([]),
                    studentTaskDegree: 0,
                });
            }
        }
        const Student = {
            ID: studentId,
            Name: studentName || "Unknown",
            Degrees: 0,
            Additional: 0,
            BasicTotal: tasks,
            TotalDegrees: 0,
            Comments: "No comments",
            studentStatus: "In Progress"
        };
        const parsedStudentData = tracksSchema_1.addStudentSchema.safeParse({
            Id: Student.ID,
            Name: Student.Name,
            Degrees: Student.Degrees,
            Additional: Student.Additional,
            BasicTotal: Student.BasicTotal,
            TotalDegrees: Student.TotalDegrees,
            Comments: Student.Comments,
            studentStatus: "In Progress"
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
        const updatedTrack = yield gitTrackFromDB.save();
        if (!updatedTrack) {
            res.status(500).json({ message: "Failed to add student" });
            return;
        }
        const gitStudent = yield studentSchema_1.StudentData.findOne({ name: studentName });
        if (!gitStudent) {
            const newStudent = new studentSchema_1.StudentData({
                name: studentName,
                tracks: [trackName]
            });
            const savedStudent = yield newStudent.save();
            if (!savedStudent) {
                res.status(500).json({ message: "Failed to add student" });
                return;
            }
        }
        else {
            yield gitStudent.updateOne({ $push: { tracks: trackName } });
        }
        res.status(201).json({ message: "Student added successfully", track: updatedTrack, studentId: studentId });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.addNewStudent = addNewStudent;
