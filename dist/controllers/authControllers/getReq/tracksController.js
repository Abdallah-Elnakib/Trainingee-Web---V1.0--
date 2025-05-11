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
const getAllTracksFromDB_1 = require("../../../utils/getAllTracksFromDB");
const tracksPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tracks = yield (0, getAllTracksFromDB_1.getAllTracksFromDB)();
        if (!tracks) {
            res.status(200).render('tracks.ejs', {
                user: req.user,
                Tracks: []
            });
            return;
        }
        res.status(200).render('tracks.ejs', {
            user: req.user,
            Tracks: tracks
        });
        return;
    }
    catch (error) {
        console.error('Error fetching tracks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.tracksPage = tracksPage;
