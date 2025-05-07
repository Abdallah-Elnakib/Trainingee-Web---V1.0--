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
exports.deleteTrack = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
const deleteTrack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const trackName = req.params.trackName;
    if (!trackName) {
        res.status(400).json({ message: "Track name is required" });
        return;
    }
    const track = yield tracksSchema_1.Track.findOne({ trackName });
    if (!track) {
        res.status(404).json({ message: "Track not found" });
        return;
    }
    const deletedTrack = yield tracksSchema_1.Track.findOneAndDelete({ trackName });
    if (!deletedTrack) {
        res.status(500).json({ message: "Failed to delete track" });
        return;
    }
    res.status(200).json({ message: "Track deleted successfully" });
});
exports.deleteTrack = deleteTrack;
