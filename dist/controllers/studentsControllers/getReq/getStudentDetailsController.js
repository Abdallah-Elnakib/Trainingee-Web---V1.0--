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
exports.getStudentDetails = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
const getStudentDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId } = req.params;
        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: 'Student ID is required'
            });
        }
        const tracks = yield tracksSchema_1.Track.find({ 'trackData.Id': parseInt(studentId) });
        if (!tracks || tracks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        const studentDetails = {
            studentInfo: null,
            tracks: []
        };
        tracks.forEach(track => {
            if (!track.trackData || !Array.isArray(track.trackData)) {
                return;
            }
            const studentInTrack = track.trackData.find((student) => student.Id === parseInt(studentId));
            if (!studentInTrack) {
                return;
            }
            if (!studentDetails.studentInfo) {
                studentDetails.studentInfo = {
                    id: studentInTrack.Id,
                    name: studentInTrack.Name,
                };
            }
            studentDetails.tracks.push({
                trackId: track._id,
                trackName: track.trackName,
                trackStartDate: track.trackStartDate,
                trackEndDate: track.trackEndDate,
                trackStatus: track.trackStatus,
                studentData: {
                    status: studentInTrack.studentStatus,
                    degrees: studentInTrack.Degrees,
                    additional: studentInTrack.Additional,
                    totalDegrees: studentInTrack.TotalDegrees,
                    comments: studentInTrack.Comments,
                    tasks: studentInTrack.BasicTotal || []
                }
            });
        });
        return res.status(200).json({
            success: true,
            studentDetails
        });
    }
    catch (error) {
        console.error('Error getting student details:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not retrieve student details. Please try again later.'
        });
    }
});
exports.getStudentDetails = getStudentDetails;
