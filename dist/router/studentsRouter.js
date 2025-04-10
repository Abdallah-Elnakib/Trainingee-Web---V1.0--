"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const addNewStudentController_1 = require("../controllers/studentControllers/postReq/addNewStudentController");
const getAllStudentsFromTrackController_1 = require("../controllers/studentControllers/getReq/getAllStudentsFromTrackController");
const updateDataFromStudentController_1 = require("../controllers/studentControllers/patchReq/updateDataFromStudentController");
const deleteStudentController_1 = require("../controllers/studentControllers/deleteReq/deleteStudentController");
const router = express_1.default.Router();
router.post('/add-new-student', addNewStudentController_1.addNewStudent);
router.get('/get-all-students/:trackName', getAllStudentsFromTrackController_1.getAllStudentsFromTrack);
router.patch('/update-student-data/:trackName', updateDataFromStudentController_1.updateDataFromStudent);
router.delete('/delete-student/:trackName', deleteStudentController_1.deleteStudent);
exports.default = router;
