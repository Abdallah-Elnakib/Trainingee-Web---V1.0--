"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addStudentSchema = exports.Track = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const trackSchema = new mongoose_1.default.Schema({
    trackName: { type: String, required: true },
    trackData: { type: Array }
});
exports.Track = mongoose_1.default.model('Tracks', trackSchema);
exports.addStudentSchema = zod_1.z.object({
    Id: zod_1.z.number().min(1, 'ID Is Required'),
    Name: zod_1.z.string().min(1, 'Name Is Required'),
    Degrees: zod_1.z.number().min(0, 'Degrees Is Required'),
    Additional: zod_1.z.number().min(0, 'Additional Is Required'),
    BasicTotal: zod_1.z.array(zod_1.z.object({
        taskName: zod_1.z.string().min(1, 'Task Name Is Required'),
        taskDegree: zod_1.z.number().min(0, 'Task Degree Is Required'),
        studentTaskDegree: zod_1.z.number().min(0, 'Student Task Degree Is Required'),
    })),
    TotalDegrees: zod_1.z.number().min(0, 'Total Degrees Is Required'),
    Comments: zod_1.z.string().min(1, 'Comments Is Required'),
    studentStatus: zod_1.z.string().min(1, 'Student Status Is Required'),
}).strict();
