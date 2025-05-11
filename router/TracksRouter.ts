import express, { Router } from 'express';
import { addNewTrack } from '../controllers/tracksControllers/postReq/addTrackController';
import { getAllTracks } from '../controllers/tracksControllers/getReq/gitAllTracksController';
import { deleteTrack } from '../controllers/tracksControllers/deleteReq/deleteTrackController';
import { updateTrack } from '../controllers/tracksControllers/patchReq/addTaskController';
import { filterTracks } from '../controllers/tracksControllers/getReq/filterTracksController';

const router: Router = express.Router();

// CRUD operations
router.post('/add-track', addNewTrack);
router.get('/all-tracks', getAllTracks);
router.delete('/delete-track/:trackId', deleteTrack);
router.patch('/update-track/add-task/:trackName', updateTrack);

// Filter endpoint
router.get('/filter', filterTracks);

export default router;