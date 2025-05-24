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
exports.deleteStudent = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
const studentSchema_1 = require("../../../models/studentSchema");
const deleteStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trackName = req.params.trackName;
        const studentId = Number(req.params.studentId);
        if (!studentId) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        if (!trackName) {
            res.status(400).json({ message: 'Missing track name' });
            return;
        }
        const track = yield tracksSchema_1.Track.findOne({ trackName });
        if (!track) {
            res.status(404).json({ message: 'Track not found' });
            return;
        }
        const studentIndex = track.trackData.findIndex((student) => student.ID === studentId);
        if (studentIndex === -1) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        // Save the student name before removing from array
        const studentName = track.trackData[studentIndex].Name;
        console.log('Deleting student:', studentName, 'with ID:', studentId, 'from track:', trackName);
        // Remove student from track
        track.trackData.splice(studentIndex, 1);
        track.markModified('trackData');
        yield track.save();
        // Now remove track from student's list of tracks
        const deletedTrack = yield studentSchema_1.StudentData.findOneAndUpdate({ name: studentName }, { $pull: { tracks: trackName } });
        if (!deletedTrack) {
            res.status(404).json({ message: 'Track not found' });
            return;
        }
        res.status(200).json({
            message: 'Student deleted successfully',
            updatedTrack: track,
            deletedTrack
        });
    }
    catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteStudent = deleteStudent;
