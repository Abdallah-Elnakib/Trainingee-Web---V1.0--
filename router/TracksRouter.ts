import express, { Router } from 'express';
import {addNewTrack} from '../controllers/tracksControllers/postReq/addTrackController'

const router: Router = express.Router();

router.post('/add-track', addNewTrack)
router.get('/all-tracks')

export default router;