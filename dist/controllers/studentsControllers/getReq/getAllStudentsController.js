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
exports.getAllStudents = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
/**
 * Controller to get all students across all tracks without duplicates
 * Supports filtering by track name and student status
 * Also supports searching by student name or student ID
 */
const getAllStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { track, status, search } = req.query;
        // Define base query for tracks
        let query = {};
        // Add track filter if provided
        if (track && track !== 'all') {
            query.trackName = track;
        }
        // Find all tracks matching filters
        const tracks = yield tracksSchema_1.Track.find(query);
        // Create a set to track processed student IDs to avoid duplicates
        const processedStudentIds = new Set();
        const allStudents = [];
        // Process all tracks and extract students
        for (const trackData of tracks) {
            if (!trackData.trackData || !Array.isArray(trackData.trackData)) {
                continue;
            }
            // Process students in this track
            for (const student of trackData.trackData) {
                // Skip if no student ID or it's already processed
                if (!student.Id || processedStudentIds.has(student.Id)) {
                    continue;
                }
                // Apply status filter if provided
                if (status && status !== 'all' && student.studentStatus !== status) {
                    continue;
                }
                // Apply search filter if provided
                if (search) {
                    const searchTerm = search.toString().toLowerCase();
                    const studentName = ((_a = student.Name) === null || _a === void 0 ? void 0 : _a.toString().toLowerCase()) || '';
                    const studentId = ((_b = student.Id) === null || _b === void 0 ? void 0 : _b.toString().toLowerCase()) || '';
                    if (!studentName.includes(searchTerm) && !studentId.includes(searchTerm)) {
                        continue;
                    }
                }
                // Add track info to student data
                const studentWithTrack = Object.assign(Object.assign({}, student), { trackInfo: {
                        trackId: trackData._id,
                        trackName: trackData.trackName
                    } });
                allStudents.push(studentWithTrack);
                processedStudentIds.add(student.Id);
            }
        }
        return res.status(200).json({
            success: true,
            students: allStudents
        });
    }
    catch (error) {
        console.error('Error getting all students:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not retrieve students. Please try again later.'
        });
    }
});
exports.getAllStudents = getAllStudents;
