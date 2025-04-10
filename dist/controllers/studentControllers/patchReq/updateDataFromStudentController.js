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
exports.updateDataFromStudent = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
const updateDataFromStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId, field, newValue } = req.body;
        const trackName = req.params.trackName;
        if (!studentId || !field || (!newValue && newValue !== 0)) {
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
        const student = track.trackData.find((student) => student.ID === studentId);
        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        student[field] = newValue;
        student.TotalDegrees = student.Degrees + student.Additional;
        track.markModified('trackData');
        yield track.save();
        res.status(200).json({
            message: 'Student data updated successfully',
            updatedStudent: student,
        });
    }
    catch (error) {
        console.error('Error updating student data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateDataFromStudent = updateDataFromStudent;
