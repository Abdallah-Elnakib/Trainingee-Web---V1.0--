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
exports.updateTrack = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
const updateTrack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        }
        catch (e) {
            console.error('Error parsing questions JSON:', e);
            // If parsing fails, make sure we have at least an empty array
            questionsData = [];
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
        yield track.save();
        res.status(200).json({ message: "Task added successfully" });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Server error while updating track" });
        return;
    }
});
exports.updateTrack = updateTrack;
