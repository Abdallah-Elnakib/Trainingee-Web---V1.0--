"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const addTrackController_1 = require("../controllers/tracksControllers/postReq/addTrackController");
const gitAllTracksController_1 = require("../controllers/tracksControllers/getReq/gitAllTracksController");
const router = express_1.default.Router();
router.post('/add-track', addTrackController_1.addNewTrack);
router.get('/all-tracks', gitAllTracksController_1.getAllTracks);
exports.default = router;
