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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrackById = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
const mongoose_1 = __importDefault(require("mongoose"));
const getTrackById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trackId = req.params.trackId;
        if (!trackId) {
            res.status(400).json({ message: 'Track ID is required' });
            return;
        }
        // Validate if trackId is a valid MongoDB ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(trackId)) {
            console.error('Invalid track ID format:', trackId);
            res.status(400).json({ message: 'Invalid track ID format' });
            return;
        }
        console.log('Fetching track with ID:', trackId);
        const track = yield tracksSchema_1.Track.findById(trackId);
        if (!track) {
            console.error('Track not found with ID:', trackId);
            res.status(404).json({ message: 'Track not found' });
            return;
        }
        console.log('Track found:', track.trackName);
        res.status(200).json({
            message: 'Track fetched successfully',
            track: {
                _id: track._id,
                trackName: track.trackName,
                trackStartDate: track.trackStartDate,
                trackEndDate: track.trackEndDate,
                trackStatus: track.trackStatus,
                trackAssignedTo: track.trackAssignedTo,
                studentNum: track.trackData ? track.trackData.length : 0
            }
        });
    }
    catch (error) {
        console.error('Error fetching track by ID:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.getTrackById = getTrackById;
