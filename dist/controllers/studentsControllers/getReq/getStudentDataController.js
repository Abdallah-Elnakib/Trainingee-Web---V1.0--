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
exports.getStudentData = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
const studentSchema_1 = require("../../../models/studentSchema");
const getStudentData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId } = req.params;
        // Get student basic info
        const student = yield studentSchema_1.StudentData.findById(studentId);
        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        console.log('Found student:', student);
        // Get tracks data for this student
        const studentTracks = student.tracks || [];
        console.log('Student tracks:', studentTracks);
        const trackDataPromises = studentTracks.map((trackName) => __awaiter(void 0, void 0, void 0, function* () {
            console.log('Processing track:', trackName);
            const track = yield tracksSchema_1.Track.findOne({ trackName });
            if (!track) {
                console.log('Track not found:', trackName);
                return null;
            }
            // Find student in track data by name instead of comparing name to itself
            const studentData = track.trackData.find((std) => std.Name === student.name);
            if (!studentData) {
                console.log('Student not found in track:', trackName);
                return null;
            }
            console.log('Found student in track:', studentData.ID, studentData.Name);
            return {
                trackName,
                status: studentData.studentStatus || 'Pending',
                degrees: studentData.Degrees || 0,
                totalDegrees: studentData.TotalDegrees || 0,
                tasks: studentData.BasicTotal || [],
                comments: studentData.Comments || 'No comments',
                // Include the student ID from the track data, which is consistent across tracks
                studentTrackId: studentData.ID
            };
        }));
        const tracksData = (yield Promise.all(trackDataPromises)).filter(track => track !== null);
        console.log('Tracks data length:', tracksData.length);
        // Find the student ID from track data if available
        const studentTrackId = tracksData.length > 0 ? tracksData[0].studentTrackId : null;
        res.status(200).json({
            student: {
                id: studentTrackId || student._id,
                name: student.name,
                username: student.username,
                tracks: student.tracks
            },
            tracksData
        });
    }
    catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getStudentData = getStudentData;
