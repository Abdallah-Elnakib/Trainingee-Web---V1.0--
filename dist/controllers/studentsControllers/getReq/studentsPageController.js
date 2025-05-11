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
exports.studentsPage = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
const studentsPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get all tracks for filter dropdown
        const tracks = yield tracksSchema_1.Track.find({}, { trackName: 1, _id: 1 });
        res.render('students', {
            Tracks: tracks,
            page: 'students',
            searchQuery: '',
            filterTrack: '',
            filterStatus: '',
            userId: req.userId,
            userName: req.userName
        });
    }
    catch (error) {
        console.error('Error loading students page:', error);
        res.status(500).render('students', {
            error: 'Could not load students page. Please try again later.',
            Tracks: [],
            page: 'students',
            userId: req.userId,
            userName: req.userName
        });
    }
});
exports.studentsPage = studentsPage;
