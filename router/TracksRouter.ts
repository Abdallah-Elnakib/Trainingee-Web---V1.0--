import express, { Router } from 'express';
import { addNewTrack } from '../controllers/tracksControllers/postReq/addTrackController';
import { getAllTracks } from '../controllers/tracksControllers/getReq/gitAllTracksController';
import { getTrackById } from '../controllers/tracksControllers/getReq/getTrackByIdController';
import { deleteTrack } from '../controllers/tracksControllers/deleteReq/deleteTrackController';
import { updateTrack } from '../controllers/tracksControllers/patchReq/addTaskController';
import { updateTrackInfo } from '../controllers/tracksControllers/patchReq/updateTrackController';
import { filterTracks } from '../controllers/tracksControllers/getReq/filterTracksController';
import { verifyJWT } from '../middleware/verifyJWT';


const router: Router = express.Router();

router.use(verifyJWT); 

router.post('/add-track', addNewTrack);
router.get('/all-tracks', getAllTracks);
router.get('/track/:trackId', getTrackById);
router.delete('/delete-track/:trackId', deleteTrack);
router.patch('/update-track/add-task/:trackName', updateTrack);
router.patch('/update-track/:trackId', updateTrackInfo);

router.get('/filter', filterTracks);

export default router;