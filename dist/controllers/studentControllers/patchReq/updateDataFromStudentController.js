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
        const { studentId } = req.body;
        const trackName = req.params.trackName;
        // Get direct field updates from request body
        const studentName = req.body.studentName;
        const studentDegrees = req.body.studentDegrees;
        const studentAdditional = req.body.studentAdditional;
        const studentComments = req.body.studentComments;
        // Log the received data for debugging
        console.log('Received update request:', {
            trackName,
            studentId,
            studentName,
            studentDegrees,
            studentAdditional,
            studentComments
        });
        // Check for required fields
        if (!studentId) {
            res.status(400).json({ message: 'Student ID is required' });
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
        const student = track.trackData.find((student) => student.ID === Number(studentId));
        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        // Update student fields if provided
        if (studentName !== undefined) {
            student.Name = studentName;
        }
        if (studentDegrees !== undefined) {
            student.Degrees = Number(studentDegrees);
        }
        if (studentAdditional !== undefined) {
            student.Additional = Number(studentAdditional);
        }
        if (studentComments !== undefined) {
            student.Comments = studentComments;
        }
        // Update total degrees calculation
        student.TotalDegrees = student.Degrees + student.Additional;
        // Mark as modified and save
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
