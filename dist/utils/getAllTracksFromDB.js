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
exports.getAllTracksFromDB = void 0;
const tracksSchema_1 = require("../models/tracksSchema");
const getAllTracksFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = [];
        const tracks = yield tracksSchema_1.Track.find();
        for (const track of tracks) {
            for (const student of track.trackData) {
                student.TotalDegrees = student.Degrees + student.Additional;
            }
            track.trackData.sort((a, b) => b.TotalDegrees - a.TotalDegrees);
            track.markModified('trackData');
            yield track.save();
            data.push({
                trackName: track.trackName,
                studentNum: track.trackData.length,
                trackData: track.trackData,
            });
        }
        return data;
    }
    catch (error) {
        console.error('Error fetching tracks:', error);
        throw new Error('Failed to fetch tracks');
    }
});
exports.getAllTracksFromDB = getAllTracksFromDB;
