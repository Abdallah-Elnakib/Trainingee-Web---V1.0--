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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentLogin = void 0;
const studentSchema_1 = require("../../../models/studentSchema");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const studentLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }
        const student = yield studentSchema_1.StudentData.findOne({ username });
        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        // Simple password check (consider using bcrypt for production)
        if (student.password !== password) {
            res.status(401).json({ message: 'Invalid password' });
            return;
        }
        const ACCESS_TOKEN = jsonwebtoken_1.default.sign({
            studentId: student._id,
            role: 'student',
            name: student.name,
            username: student.username
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        const REFRESH_TOKEN = jsonwebtoken_1.default.sign({
            studentId: student._id,
            role: 'student',
            name: student.name,
            username: student.username
        }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d" });
        req.session.refreshToken = REFRESH_TOKEN;
        res.status(200).json({
            ACCESS_TOKEN,
            REFRESH_TOKEN,
            user: {
                id: student._id,
                name: student.name,
                username: student.username,
                role: 'student',
                tracks: student.tracks
            }
        });
        return;
    }
    catch (error) {
        console.error('Error during student login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.studentLogin = studentLogin;
