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
        const trackName = [];
        const tracks = yield tracksSchema_1.Track.find();
        for (const track of tracks) {
            trackName.push(track.trackName);
        }
        return trackName;
    }
    catch (error) {
        console.error('Error fetching tracks:', error);
        throw new Error('Failed to fetch tracks');
    }
});
exports.getAllTracksFromDB = getAllTracksFromDB;
