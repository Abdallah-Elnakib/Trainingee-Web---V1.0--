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
exports.deleteTrack = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
const mongoose_1 = __importDefault(require("mongoose"));
const deleteTrack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trackId = req.params.trackId;
        console.log('Received delete request for track ID:', trackId);
        // Validate track ID format
        if (!trackId) {
            console.log('Track ID is missing in request');
            res.status(400).json({ message: "Track ID is required" });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(trackId)) {
            console.log('Invalid track ID format:', trackId);
            res.status(400).json({ message: `Invalid track ID format: ${trackId}` });
            return;
        }
        // Find the track by ID
        const track = yield tracksSchema_1.Track.findById(trackId);
        if (!track) {
            console.log('Track not found with ID:', trackId);
            res.status(404).json({ message: `Track not found with ID: ${trackId}` });
            return;
        }
        console.log('Found track to delete:', track.trackName);
        // Delete the track
        const deletedTrack = yield tracksSchema_1.Track.findByIdAndDelete(trackId);
        if (!deletedTrack) {
            console.log('Failed to delete track - database operation returned null');
            res.status(500).json({ message: "Failed to delete track - database error" });
            return;
        }
        console.log('Track deleted successfully:', deletedTrack.trackName);
        res.status(200).json({
            message: "Track deleted successfully",
            deletedTrack: {
                id: deletedTrack._id,
                name: deletedTrack.trackName
            }
        });
    }
    catch (error) {
        console.error("Error deleting track:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.deleteTrack = deleteTrack;
