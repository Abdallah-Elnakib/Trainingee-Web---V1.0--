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
exports.tracksPage = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
const tracksPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if there are filter parameters in the query string
        const status = req.query.status;
        const search = req.query.search;
        const dateFrom = req.query.dateFrom;
        const dateTo = req.query.dateTo;
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.perPage) || 10;
        // Determine if we have active filters
        const hasFilters = !!(status || search || dateFrom || dateTo);
        let tracks;
        let totalTracks = 0;
        // Build query object
        const query = {};
        // Add filters to query if provided
        if (hasFilters) {
            console.log('Applying filters from URL parameters:', { status, search, dateFrom, dateTo });
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
            console.log('Applying MongoDB query:', JSON.stringify(query));
        }
        // Count total number of tracks that match the query
        totalTracks = yield tracksSchema_1.Track.countDocuments(query);
        // Calculate pagination values
        const totalPages = Math.ceil(totalTracks / itemsPerPage);
        const skip = (page - 1) * itemsPerPage;
        // Get tracks with pagination
        const paginatedTracks = yield tracksSchema_1.Track.find(query)
            .sort({ trackStartDate: -1 }) // Sort by start date, newest first
            .skip(skip)
            .limit(itemsPerPage);
        console.log(`Found ${totalTracks} total tracks, showing page ${page} of ${totalPages} with ${itemsPerPage} items per page`);
        // Process tracks to return required format
        tracks = paginatedTracks.map(track => ({
            _id: track._id,
            trackName: track.trackName,
            trackStartDate: track.trackStartDate,
            trackEndDate: track.trackEndDate,
            trackStatus: track.trackStatus,
            trackAssignedTo: track.trackAssignedTo,
            studentNum: track.trackData ? track.trackData.length : 0,
            trackData: track.trackData || []
        }));
        // Prepare pagination info
        const paginationInfo = {
            currentPage: page,
            totalPages: totalPages,
            itemsPerPage: itemsPerPage,
            totalItems: totalTracks,
            startItem: skip + 1,
            endItem: Math.min(skip + itemsPerPage, totalTracks)
        };
        if (!tracks || tracks.length === 0) {
            res.status(200).render('tracks.ejs', {
                user: req.user,
                Tracks: [],
                filters: { status, search, dateFrom, dateTo },
                pagination: paginationInfo
            });
            return;
        }
        res.status(200).render('tracks.ejs', {
            user: req.user,
            Tracks: tracks,
            filters: { status, search, dateFrom, dateTo },
            pagination: paginationInfo
        });
        return;
    }
    catch (error) {
        console.error('Error fetching tracks:', error);
        res.status(500).render('tracks.ejs', {
            user: req.user,
            Tracks: [],
            error: 'Failed to load tracks. Please try again.'
        });
    }
});
exports.tracksPage = tracksPage;
