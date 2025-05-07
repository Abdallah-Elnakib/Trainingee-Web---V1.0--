import express, { Router } from 'express';
import { addNewStudent } from '../controllers/studentControllers/postReq/addNewStudentController';
import { getAllStudentsFromTrack } from '../controllers/studentControllers/getReq/getAllStudentsFromTrackController';
import { updateDataFromStudent } from '../controllers/studentControllers/patchReq/updateDataFromStudentController';
import { deleteStudent } from '../controllers/studentControllers/deleteReq/deleteStudentController';
import { getStudentTasks } from '../controllers/studentsControllers/getReq/getStudentTasksController';
import { updateStudentTasks } from '../controllers/studentsControllers/patchReq/updateStudentTasksController';
import { updateStudentStatus } from '../controllers/studentsControllers/patchReq/updateStudentStatusController';

const router: Router = express.Router();

router.post('/add-new-student', addNewStudent);
router.get('/get-all-students/:trackName', getAllStudentsFromTrack);
router.patch('/update-student-data/:trackName', updateDataFromStudent);
router.delete('/delete-student/:trackName', deleteStudent);

// New endpoints for task management
router.get('/get-student-tasks/:trackName/:studentId', getStudentTasks);
router.patch('/update-student-tasks/:trackName/:studentId', updateStudentTasks);

// New endpoint for updating student status
router.patch('/update-student-status/:trackName', updateStudentStatus);

export default router;