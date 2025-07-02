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
const studentSchema_1 = require("../../../models/studentSchema");
const getAllStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { track, status, search } = req.query;
        console.log('API Request - getAllStudents:', { track, status, search });
        console.log('====== DEBUGGING STUDENT TRACKS ISSUE ======');
        console.log('Request query parameters:', req.query);
        // First, check if we can get any students from the StudentData collection
        console.log('Checking StudentData collection...');
        try {
            const allStudentData = yield studentSchema_1.StudentData.find().limit(10);
            console.log(`Found ${allStudentData.length} student records in StudentData collection`);
            if (allStudentData.length > 0) {
                console.log('Sample student data:', allStudentData[0]);
            }
        }
        catch (studentDataError) {
            console.error('Error accessing StudentData collection:', studentDataError);
        }
        let trackQuery = {};
        if (track && track !== 'all') {
            trackQuery.trackName = track;
        }
        console.log('Track query:', trackQuery);
        const tracks = yield tracksSchema_1.Track.find(trackQuery);
        console.log(`Found ${tracks.length} tracks matching filters`);
        console.log('Available tracks:');
        tracks.forEach((track, index) => {
            var _a;
            const trackObj = track.toObject ? track.toObject() : track;
            console.log(`  Track ${index + 1}: ${trackObj.trackName} (${trackObj._id})`);
            console.log(`    Students in track: ${((_a = trackObj.trackData) === null || _a === void 0 ? void 0 : _a.length) || 0}`);
        });
        let counter = 0;
        const trackData = {};
        const studentNames = [];
        const studentIds = [];
        const studentMap = {};
        console.log(`Starting to process ${tracks.length} tracks`);
        for (const currentTrack of tracks) {
            const track = currentTrack.toObject ? currentTrack.toObject() : currentTrack;
            const trackName = track.trackName || 'Unknown Track';
            const trackId = track._id.toString();
            if (!track.trackData || !Array.isArray(track.trackData)) {
                console.log(`Track ${trackName} has no student data or is invalid. Skipping.`);
                continue;
            }
            console.log(`Processing ${track.trackData.length} students in "${trackName}" track`);
            if (!trackData[trackName]) {
                trackData[trackName] = [];
            }
            for (const student of track.trackData) {
                if (!student || typeof student !== 'object')
                    continue;
                const studentId = student.Id || student.ID;
                if (!studentId)
                    continue;
                const studentIdString = studentId.toString();
                const studentName = student.Name || student.name || 'Unknown Student';
                const studentStatus = student.studentStatus || student.Status || 'Pending';
                if (status && status !== 'all' && studentStatus !== status) {
                    continue;
                }
                if (search) {
                    const searchTerm = search.toString().toLowerCase();
                    const studentNameLower = studentName.toString().toLowerCase();
                    const studentIdLower = studentIdString.toLowerCase();
                    if (!studentNameLower.includes(searchTerm) && !studentIdLower.includes(searchTerm)) {
                        continue;
                    }
                }
                let formattedId = studentIdString;
                if (!isNaN(Number(studentIdString))) {
                    formattedId = studentIdString.padStart(4, '0');
                }
                const studentData = {
                    Id: formattedId,
                    Name: studentName,
                    TotalDegrees: student.TotalDegrees || student.totalDegrees || 0,
                    BasicTotal: student.BasicTotal || student.basicTotal || [],
                    studentStatus: studentStatus,
                    Comments: student.Comments || student.comments || '',
                    trackInfo: { trackId, trackName },
                };
                trackData[trackName].push(studentData);
                if (!studentIds.includes(studentIdString)) {
                    studentIds.push(studentIdString);
                    studentNames.push(studentName);
                    studentMap[studentIdString] = Object.assign(Object.assign({}, studentData), { trackNames: [trackName], trackCount: 1 });
                    console.log(`[New Student] Added student ${studentIdString} (${studentName}) to track: ${trackName}`);
                }
                else {
                    let studentRecord = studentMap[studentIdString];
                    if (!Array.isArray(studentRecord.trackNames)) {
                        studentRecord.trackNames = [];
                    }
                    if (!studentRecord.trackNames.includes(trackName)) {
                        studentRecord.trackNames.push(trackName);
                        studentRecord.trackCount = studentRecord.trackNames.length;
                        console.log(`[Existing Student] Added new track ${trackName} to student ${studentIdString}, now has ${studentRecord.trackCount} tracks`);
                    }
                    studentRecord.trackInfo = Object.assign(Object.assign({}, studentRecord.trackInfo), { trackId, trackName });
                }
            }
            counter++;
        }
        let finalStudents = Object.values(studentMap);
        finalStudents = finalStudents.map(student => {
            if (!Array.isArray(student.trackNames)) {
                student.trackNames = [];
                if (student.trackInfo && student.trackInfo.trackName) {
                    student.trackNames.push(student.trackInfo.trackName);
                }
            }
            if (Array.isArray(student.trackNames)) {
                const uniqueTracks = [...new Set(student.trackNames)];
                student.trackNames = uniqueTracks;
            }
            const isDefaultList = Array.isArray(student.trackNames) &&
                student.trackNames.length === 11 &&
                student.trackNames.includes("Node Js") &&
                student.trackNames.includes("Html") &&
                student.trackNames.includes("Css") &&
                student.trackNames.includes("python") &&
                student.trackNames.includes("React 1");
            if (isDefaultList) {
                console.log(`Fixing hardcoded tracks for student ${student.Id}`);
                const studentId = student.Id.toString().replace(/^0+/, '');
                const actualTracks = [];
                for (const trackName in trackData) {
                    const studentsInTrack = trackData[trackName];
                    const isInTrack = studentsInTrack.some(s => {
                        const sId = (s.Id || '').toString().replace(/^0+/, '');
                        return sId === studentId;
                    });
                    if (isInTrack && !actualTracks.includes(trackName)) {
                        actualTracks.push(trackName);
                    }
                }
                student.trackNames = actualTracks;
                student.trackCount = actualTracks.length;
                console.log(`Updated student ${student.Id} to have ${student.trackCount} tracks: ${actualTracks.join(', ')}`);
            }
            else {
                student.trackCount = Array.isArray(student.trackNames) ? student.trackNames.length : 0;
            }
            return student;
        });
        let maxTrackCount = 0;
        let studentsWithMultipleTracks = 0;
        finalStudents.forEach(student => {
            if (student.trackCount > maxTrackCount) {
                maxTrackCount = student.trackCount;
            }
            if (student.trackCount > 1) {
                studentsWithMultipleTracks++;
            }
        });
        console.log('-------- STUDENT STATISTICS --------');
        console.log(`Processed ${counter} tracks`);
        console.log(`Found ${finalStudents.length} unique students`);
        console.log(`Students with multiple tracks: ${studentsWithMultipleTracks}`);
        console.log(`Maximum tracks per student: ${maxTrackCount}`);
        console.log('\n-------------- DETAILED TRACK ANALYSIS ---------------');
        const trackCountReport = {};
        finalStudents.forEach(student => {
            const count = student.trackCount || 0;
            trackCountReport[count] = (trackCountReport[count] || 0) + 1;
        });
        console.log('Track count distribution:');
        Object.keys(trackCountReport).sort((a, b) => Number(a) - Number(b)).forEach(count => {
            console.log(`  Students with ${count} tracks: ${trackCountReport[Number(count)]}`);
        });
        console.log('\nSample students by track count:');
        const allSameTrackCount = finalStudents.every(s => s.trackCount === finalStudents[0].trackCount);
        console.log(`All students have the same track count: ${allSameTrackCount ? 'YES' : 'NO'}`);
        if (finalStudents.length > 0) {
            finalStudents.sort((a, b) => b.trackCount - a.trackCount);
            console.log('\nStudent with most tracks:');
            const mostTracksStudent = finalStudents[0];
            console.log(JSON.stringify({
                Id: mostTracksStudent.Id,
                Name: mostTracksStudent.Name,
                trackCount: mostTracksStudent.trackCount,
                trackNames: mostTracksStudent.trackNames
            }, null, 2));
            const singleTrackStudent = finalStudents.find(s => s.trackCount === 1);
            if (singleTrackStudent) {
                console.log('\nSample student with one track:');
                console.log(JSON.stringify({
                    Id: singleTrackStudent.Id,
                    Name: singleTrackStudent.Name,
                    trackCount: singleTrackStudent.trackCount,
                    trackNames: singleTrackStudent.trackNames
                }, null, 2));
            }
            console.log('\nFirst, middle and last student comparison:');
            const first = finalStudents[0];
            const middle = finalStudents[Math.floor(finalStudents.length / 2)];
            const last = finalStudents[finalStudents.length - 1];
            [first, middle, last].forEach((student, idx) => {
                const position = idx === 0 ? 'FIRST' : idx === 1 ? 'MIDDLE' : 'LAST';
                console.log(`${position} STUDENT: ID=${student.Id}, Name=${student.Name}`);
                console.log(`  Track Count: ${student.trackCount}`);
                console.log(`  Track Names: ${JSON.stringify(student.trackNames)}`);
            });
        }
        console.log('------------------------------------');
        // Log the final structure we're sending to the frontend
        console.log(`Sending ${finalStudents.length} students to frontend`);
        if (finalStudents.length > 0) {
            console.log('First student data sample:', {
                Id: finalStudents[0].Id,
                Name: finalStudents[0].Name,
                trackCount: finalStudents[0].trackCount,
                studentStatus: finalStudents[0].studentStatus,
                trackNames: finalStudents[0].trackNames
            });
        }
        else {
            console.log('WARNING: No students found to return');
        }
        // If no students found, try to check if there's any Track data at all
        if (finalStudents.length === 0) {
            const trackCount = yield tracksSchema_1.Track.countDocuments();
            console.log(`Found ${trackCount} tracks in total`);
            if (trackCount > 0) {
                const sampleTrack = yield tracksSchema_1.Track.findOne();
                if (sampleTrack && sampleTrack.trackData && Array.isArray(sampleTrack.trackData)) {
                    console.log(`Sample track has ${sampleTrack.trackData.length} student records`);
                    if (sampleTrack.trackData.length > 0) {
                        console.log('Sample student from track data:', sampleTrack.trackData[0]);
                    }
                }
            }
        }
        return res.status(200).json({
            success: true,
            count: finalStudents.length,
            students: finalStudents
        });
    }
    catch (error) {
        console.error('Error in getAllStudents:', error);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving students data',
            error: error.message
        });
    }
});
exports.getAllStudents = getAllStudents;
