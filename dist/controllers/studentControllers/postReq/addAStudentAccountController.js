"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNewStudentAccount = void 0;
const studentSchema_1 = require("../../../models/studentSchema");
const addNewStudentAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentName, studentUsername, studentPassword } = req.body;
    try {
        const getStudent = yield studentSchema_1.StudentData.findOne({ name: studentName });
        if (!getStudent) {
            res.status(201).json({ message: "Student not found" });
            return;
        }
        yield studentSchema_1.StudentData.findByIdAndUpdate(getStudent._id, { username: studentUsername, password: studentPassword }, { new: true });
        res.status(201).json({ message: "Student added Account successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.addNewStudentAccount = addNewStudentAccount;
