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
        console.log("Extracted data:", { trackName, taskName, taskGrade });
        if (!trackName) {
            console.log("Missing trackName");
            res.status(400).json({ message: "Track name is required" });
            return;
        }
        if (!taskName) {
            console.log("Missing taskName");
            res.status(400).json({ message: "Task name is required" });
            return;
        }
        if (taskGrade === undefined || taskGrade === null) {
            console.log("Missing taskGrade");
            res.status(400).json({ message: "Task grade is required" });
            return;
        }
        const track = yield tracksSchema_1.Track.findOne({ trackName });
        if (!track) {
            console.log("Track not found");
            res.status(404).json({ message: "Track not found" });
            return;
        }
        if (!Array.isArray(track.trackData)) {
            res.status(500).json({ message: "Invalid track data structure" });
            return;
        }
        // Add the new task to each student's BasicTotal array
        for (const student of track.trackData) {
            if (!Array.isArray(student.BasicTotal)) {
                student.BasicTotal = [];
            }
            student.BasicTotal.push({
                taskName: taskName,
                taskDegree: taskGrade // Using taskGrade as initial degree
            });
        }
        // Mark the trackData array as modifie
        track.markModified('trackData');
        console.log(track.trackData);
        yield track.save();
        res.status(200).json({ message: "Task added successfully" });
        return;
    }
    catch (error) {
        console.error("Error updating track:", error);
        res.status(500).json({ message: "Server error while updating track" });
        return;
    }
});
exports.updateTrack = updateTrack;
