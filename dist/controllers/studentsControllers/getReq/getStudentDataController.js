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
        // Get tracks data for this student (eliminando duplicados)
        const studentTracks = student.tracks || [];
        console.log('Student tracks (original):', studentTracks);
        // Eliminar tracks duplicados, manteniendo solo uno por nombre
        const uniqueTrackNames = new Set();
        const uniqueTracks = [];
        // Primera pasada: obtener todos los nombres de tracks únicos
        studentTracks.forEach((trackItem) => {
            let trackName;
            if (typeof trackItem === 'string') {
                trackName = trackItem;
            }
            else if (typeof trackItem === 'object' && trackItem && trackItem.trackName) {
                trackName = trackItem.trackName;
            }
            else {
                return; // Ignorar elementos no reconocidos
            }
            // Si este trackName no está ya en el conjunto, añadirlo
            if (!uniqueTrackNames.has(trackName)) {
                uniqueTrackNames.add(trackName);
                // Preferir el formato de objeto si está disponible
                const objectFormat = studentTracks.find((t) => typeof t === 'object' && t && t.trackName === trackName);
                uniqueTracks.push(objectFormat || trackName);
            }
        });
        console.log('Student tracks (unique):', uniqueTracks);
        // Definir tipo explícito para el array de tracks únicos
        const uniqueTracksArray = uniqueTracks;
        // Usar el array de tracks únicos en lugar del original
        const trackDataPromises = uniqueTracksArray.map((trackItem) => __awaiter(void 0, void 0, void 0, function* () {
            // Manejar estructura mixta de tracks (strings y objetos)
            let trackName;
            if (typeof trackItem === 'string') {
                // Formato antiguo: string simple
                trackName = trackItem;
            }
            else if (typeof trackItem === 'object' && trackItem && trackItem.trackName) {
                // Formato nuevo: objeto con propiedad trackName
                trackName = trackItem.trackName;
            }
            else {
                console.log('Formato de track no reconocido:', trackItem);
                return null;
            }
            console.log('Processing track:', trackName);
            const track = yield tracksSchema_1.Track.findOne({ trackName });
            if (!track) {
                console.log('Track not found:', trackName);
                return null;
            }
            // Verificar si trackData existe y es un array
            if (!track.trackData || !Array.isArray(track.trackData)) {
                console.log('Track data no es un array válido:', trackName);
                // Crear un objeto vacío para este track en lugar de devolver null
                return {
                    trackName,
                    status: 'Pending',
                    degrees: 0,
                    totalDegrees: 0,
                    tasks: [],
                    comments: 'No se encontraron datos del estudiante',
                    studentTrackId: student._id // Corregido: usando student._id en lugar de studentId
                };
            }
            // Find student in track data by name instead of comparing name to itself
            const studentData = track.trackData.find((std) => std && std.Name === student.name);
            if (!studentData) {
                console.log('Student not found in track data:', trackName);
                // Crear un objeto vacío para este track en lugar de devolver null
                return {
                    trackName,
                    status: 'Pending',
                    degrees: 0,
                    totalDegrees: 0,
                    tasks: [],
                    comments: 'No se encontraron datos del estudiante',
                    studentTrackId: student._id // Corregido: usando student._id en lugar de studentId
                };
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
        // Enviar el array de tracks únicos en lugar del original con duplicados
        res.status(200).json({
            student: {
                id: studentTrackId || student._id,
                name: student.name,
                username: student.username,
                tracks: uniqueTracksArray // Usar el array de tracks únicos en lugar de student.tracks
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
