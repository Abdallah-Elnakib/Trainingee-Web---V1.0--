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
        const getTasks = yield tracksSchema_2.Track.findOne({ trackName });
        const tasks = getTasks === null || getTasks === void 0 ? void 0 : getTasks.trackData[0].BasicTotal;
        for (const task of tasks) {
            task.studentTaskDegree = 0;
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
        res.status(201).json({ message: "Student added successfully", track: updatedTrack, studentId: studentId });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.addNewStudent = addNewStudent;
