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
exports.addNewTrack = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
const addNewTrack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { trackName } = req.body;
        // Validate required fields
        if (!trackName) {
            res.status(400).json({ message: 'Track Name is required' });
            return;
        }
        const existingTrack = yield tracksSchema_1.Track.findOne({ trackName });
        if (existingTrack) {
            res.status(409).json({ message: 'Track already exists' });
            return;
        }
        // Create a new track instance
        const newTrack = new tracksSchema_1.Track({
            trackName,
        });
        // Save the track to the database
        const savedTrack = yield newTrack.save();
        // Respond with the saved track
        res.status(201).json({
            message: 'Track added successfully',
            track: savedTrack,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.addNewTrack = addNewTrack;
