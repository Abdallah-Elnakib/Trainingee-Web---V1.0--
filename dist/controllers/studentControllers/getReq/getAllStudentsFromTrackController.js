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
exports.getAllStudentsFromTrack = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
const getAllStudentsFromTrack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { trackName } = req.params;
        if (!trackName) {
            res.status(400).json({ message: "Track name is required" });
            return;
        }
        const trackFromDB = yield tracksSchema_1.Track.findOne({ trackName });
        if (!trackFromDB) {
            res.status(404).json({ message: "Track not found" });
            return;
        }
        res.status(200).json({ students: trackFromDB.trackData });
    }
    catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAllStudentsFromTrack = getAllStudentsFromTrack;
