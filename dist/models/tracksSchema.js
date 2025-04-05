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
    Degrees: zod_1.z.number().optional(),
    Additional: zod_1.z.number().optional(),
    BasicTotal: zod_1.z.number().min(1, 'Basic Total Is Required'),
    TotalDegrees: zod_1.z.number().optional(),
    Comments: zod_1.z.string().optional(),
    Ranking: zod_1.z.number().min(1, 'Ranking Is Required')
});
