"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const addTrackController_1 = require("../controllers/tracksControllers/postReq/addTrackController");
const gitAllTracksController_1 = require("../controllers/tracksControllers/getReq/gitAllTracksController");
const deleteTrackController_1 = require("../controllers/tracksControllers/deleteReq/deleteTrackController");
const addTaskController_1 = require("../controllers/tracksControllers/patchReq/addTaskController");
const router = express_1.default.Router();
router.post('/add-track', addTrackController_1.addNewTrack);
router.get('/all-tracks', gitAllTracksController_1.getAllTracks);
router.delete('/delete-track/:trackName', deleteTrackController_1.deleteTrack);
router.patch('/update-track/add-task/:trackName', addTaskController_1.updateTrack);
exports.default = router;
