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
exports.signup = void 0;
const userModel_1 = require("../../../models/userModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_2 = require("../../../models/userModel");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validation = userModel_1.userSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                message: "Validation error",
                errors: validation.error.issues
            });
            return;
        }
        const { firstName, lastName, username, email, password, role } = req.body;
        const existingUser = yield userModel_2.Users.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            res.status(409).json({
                message: "User with this email or username already exists"
            });
            return;
        }
        if (password.length < 8) {
            res.status(400).json({
                message: "Password must be at least 8 characters"
            });
            return;
        }
        const hashPassword = yield bcryptjs_1.default.hash(password + process.env.SOLT, 10);
        const user = new userModel_2.Users({
            firstName,
            lastName,
            username,
            email,
            password: hashPassword,
            role: role || 'user',
        });
        yield user.save();
        const ACCESS_TOKEN = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role, firstName: user.firstName, lastName: user.lastName }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        const REFRESH_TOKEN = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role, firstName: user.firstName, lastName: user.lastName }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        req.session.refreshToken = REFRESH_TOKEN;
        res.status(201).json({
            ACCESS_TOKEN,
            REFRESH_TOKEN,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
        return;
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
        return;
    }
});
exports.signup = signup;
