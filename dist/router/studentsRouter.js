"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const addNewStudentController_1 = require("../controllers/studentControllers/postReq/addNewStudentController");
const getAllStudentsFromTrackController_1 = require("../controllers/studentControllers/getReq/getAllStudentsFromTrackController");
const router = express_1.default.Router();
router.post('/add-new-student', addNewStudentController_1.addNewStudent);
router.get('/get-all-students/:trackName', getAllStudentsFromTrackController_1.getAllStudentsFromTrack);
exports.default = router;
``;
