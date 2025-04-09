import express, { Router } from 'express';
import {addNewTrack} from '../controllers/tracksControllers/postReq/addTrackController'
import { getAllTracks } from '../controllers/tracksControllers/getReq/gitAllTracksController';

const router: Router = express.Router();

router.post('/add-track', addNewTrack)
router.get('/all-tracks', getAllTracks)

export default router;