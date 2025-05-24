import express, { Router } from 'express';
import { addNewStudent } from '../controllers/studentControllers/postReq/addNewStudentController';
import { getAllStudentsFromTrack } from '../controllers/studentControllers/getReq/getAllStudentsFromTrackController';
import { updateDataFromStudent } from '../controllers/studentControllers/patchReq/updateDataFromStudentController';
import { deleteStudent } from '../controllers/studentControllers/deleteReq/deleteStudentController';
import { getStudentTasks } from '../controllers/studentsControllers/getReq/getStudentTasksController';
import { updateStudentTasks } from '../controllers/studentsControllers/patchReq/updateStudentTasksController';
import { updateStudentStatus } from '../controllers/studentsControllers/patchReq/updateStudentStatusController';
import { getAllStudents } from '../controllers/studentsControllers/getReq/getAllStudentsController';
import { getStudentDetails } from '../controllers/studentsControllers/getReq/getStudentDetailsController';
import {addNewStudentAccount} from '../controllers/studentControllers/postReq/addAStudentAccountController';
import { verifyJWT } from '../middleware/verifyJWT';

const router: Router = express.Router();

router.use(verifyJWT); 

router.post('/add-new-student', addNewStudent);
router.get('/get-all-students/:trackName', getAllStudentsFromTrack);

router.patch('/update-student-data/:trackName', updateDataFromStudent);
router.patch('/update-student/:trackName', updateDataFromStudent);

router.delete('/delete-student/:trackName', deleteStudent);

router.get('/get-student-tasks/:trackName/:studentId', getStudentTasks);
router.patch('/update-student-tasks/:trackName/:studentId', updateStudentTasks);

router.patch('/update-student-status/:trackName', updateStudentStatus);

router.get('/all-students', getAllStudents as any);
router.get('/student-details/:studentId', getStudentDetails as any);

router.post('/add-student-account', addNewStudentAccount);

export default router;