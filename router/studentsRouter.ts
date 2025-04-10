import express, { Router } from 'express';
import { addNewStudent } from '../controllers/studentControllers/postReq/addNewStudentController';
import {getAllStudentsFromTrack} from '../controllers/studentControllers/getReq/getAllStudentsFromTrackController'
import { updateDataFromStudent } from '../controllers/studentControllers/patchReq/updateDataFromStudentController';

const router: Router = express.Router();

router.post('/add-new-student', addNewStudent);
router.get('/get-all-students/:trackName', getAllStudentsFromTrack);
router.patch('/update-student-data/:trackName', updateDataFromStudent);


export default router;``