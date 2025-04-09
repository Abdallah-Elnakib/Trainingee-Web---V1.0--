import express, { Router } from 'express';
import { addNewStudent } from '../controllers/studentControllers/postReq/addNewStudentController';
import {getAllStudentsFromTrack} from '../controllers/studentControllers/getReq/getAllStudentsFromTrackController'

const router: Router = express.Router();

router.post('/add-new-student', addNewStudent);
router.get('/get-all-students/:trackName', getAllStudentsFromTrack);



export default router;``