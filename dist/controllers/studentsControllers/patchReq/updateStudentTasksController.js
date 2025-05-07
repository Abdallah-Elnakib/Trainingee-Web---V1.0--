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
exports.updateStudentTasks = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
const updateStudentTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const track = yield tracksSchema_1.Track.findOne({ trackName });
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
        tasks.forEach((updatedTask) => {
            if (updatedTask.index >= 0 && updatedTask.index < student.BasicTotal.length) {
                // Get the maximum possible grade for this task
                const maxGrade = student.BasicTotal[updatedTask.index].taskDegree;
                // Ensure the student's grade doesn't exceed the maximum
                const validatedGrade = Math.min(updatedTask.studentTaskDegree, maxGrade);
                // Update the student's grade for this task
                student.BasicTotal[updatedTask.index].studentTaskDegree = validatedGrade;
            }
        });
        student.BasicTotal.forEach((task) => {
            totalStudentTaskGrades += task.studentTaskDegree || 0;
        });
        student.Degrees = totalStudentTaskGrades;
        track.markModified('trackData');
        yield track.save();
        res.status(200).json({
            message: "Tasks updated successfully",
            degrees: student.Degrees,
            totalStudentTaskGrades: totalStudentTaskGrades
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error while updating student tasks" });
    }
});
exports.updateStudentTasks = updateStudentTasks;
