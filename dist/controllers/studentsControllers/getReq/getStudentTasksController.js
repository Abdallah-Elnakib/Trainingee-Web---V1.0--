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
exports.getStudentTasks = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
const getStudentTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const track = yield tracksSchema_1.Track.findOne({ trackName });
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
    }
    catch (error) {
        res.status(500).json({ message: "Server error while retrieving student tasks" });
    }
});
exports.getStudentTasks = getStudentTasks;
