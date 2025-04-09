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
        let Space = 0;
        for (const Name of studentName) {
            if (Name === " ") {
                Space += 1;
            }
        }
        if (Space <= 1) {
            res.status(400).json({ message: "The student's full name must be entered." });
            return;
        }
        const Student = {
            ID: gitTrackFromDB.trackData.length + 1,
            Name: studentName || "Unknown",
            Degrees: 0,
            Additional: 0,
            BasicTotal: 0,
            TotalDegrees: 0,
            Comments: "No comments"
        };
        const parsedStudentData = tracksSchema_1.addStudentSchema.safeParse({ Id: Student.ID, Name: Student.Name, Degrees: Student.Degrees, Additional: Student.Additional, BasicTotal: Student.BasicTotal, TotalDegrees: Student.TotalDegrees, Comments: Student.Comments });
        if (!parsedStudentData.success) {
            res.status(400).json({ message: "Invalid student data", errors: parsedStudentData.error.errors[0] });
            return;
        }
        const studentExists = gitTrackFromDB.trackData.some((student) => student.Name === parsedStudentData.data.Name);
        if (studentExists) {
            res.status(400).json({ message: "Student already exists" });
            return;
        }
        gitTrackFromDB.trackData.push(Student);
        const updatedTrack = yield gitTrackFromDB.save();
        if (!updatedTrack) {
            res.status(500).json({ message: "Failed to add student" });
            return;
        }
        res.status(201).json({ message: "Student added successfully", track: updatedTrack });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.addNewStudent = addNewStudent;
