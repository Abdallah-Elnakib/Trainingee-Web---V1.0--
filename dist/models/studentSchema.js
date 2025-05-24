"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentData = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const studentSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    name: { type: String, required: true },
    tracks: { type: Array, required: true },
});
exports.StudentData = mongoose_1.default.model("Students", studentSchema);
