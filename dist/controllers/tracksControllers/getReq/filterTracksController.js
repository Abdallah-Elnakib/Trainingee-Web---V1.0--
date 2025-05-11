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
exports.filterTracks = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
const filterTracks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Filter query parameters:', req.query);
        // Get filter parameters from query string
        const status = req.query.status;
        const search = req.query.search;
        const dateFrom = req.query.dateFrom;
        const dateTo = req.query.dateTo;
        // Build query object
        const query = {};
        // Add status filter if provided
        if (status && status.trim() !== '') {
            query.trackStatus = status;
        }
        // Add date range filters if provided
        if (dateFrom && dateFrom.trim() !== '') {
            query.trackStartDate = { $gte: new Date(dateFrom) };
        }
        if (dateTo && dateTo.trim() !== '') {
            query.trackEndDate = { $lte: new Date(dateTo) };
        }
        // Add search filter if provided (search in track name and assigned to fields)
        if (search && search.trim() !== '') {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { trackName: searchRegex },
                { trackAssignedTo: searchRegex }
            ];
        }
        console.log('MongoDB query:', JSON.stringify(query));
        // Execute query
        const tracks = yield tracksSchema_1.Track.find(query);
        console.log(`Found ${tracks.length} tracks matching filters`);
        // Process tracks to return required data
        const formattedTracks = tracks.map(track => {
            // Process track data (calculate total degrees, etc.)
            const trackData = track.trackData.map(student => {
                const totalDegrees = student.Degrees + student.Additional;
                return Object.assign(Object.assign({}, student.toObject()), { TotalDegrees: totalDegrees });
            });
            // Sort track data by total degrees
            trackData.sort((a, b) => b.TotalDegrees - a.TotalDegrees);
            // Return formatted track
            return {
                _id: track._id,
                trackName: track.trackName,
                trackStartDate: track.trackStartDate,
                trackEndDate: track.trackEndDate,
                trackStatus: track.trackStatus,
                trackAssignedTo: track.trackAssignedTo,
                trackData: trackData,
                studentNum: track.trackData.length
            };
        });
        // Return filtered tracks
        res.status(200).json(formattedTracks);
    }
    catch (error) {
        console.error('Error filtering tracks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.filterTracks = filterTracks;
