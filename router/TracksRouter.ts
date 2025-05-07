import express, { Router } from 'express';
import { addNewTrack } from '../controllers/tracksControllers/postReq/addTrackController'
import { getAllTracks } from '../controllers/tracksControllers/getReq/gitAllTracksController';
import { deleteTrack } from '../controllers/tracksControllers/deleteReq/deleteTrackController'
import { updateTrack } from '../controllers/tracksControllers/patchReq/addTaskController'
const router: Router = express.Router();

router.post('/add-track', addNewTrack);
router.get('/all-tracks', getAllTracks);
router.delete('/delete-track/:trackName', deleteTrack);
router.patch('/update-track/add-task/:trackName', updateTrack);

export default router;