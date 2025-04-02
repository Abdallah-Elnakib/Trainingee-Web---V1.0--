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
exports.forgotPassword = void 0;
const userModel_1 = require("../models/userModel");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mailesFormulas_1 = require("../utils/mailesFormulas");
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }
        const user = yield userModel_1.Users.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Email not found" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.RESET_PASSWORD_SECRET, { expiresIn: '1h' });
        yield userModel_1.Users.updateOne({ email }, { $set: { resetPasswordToken: token } });
        yield (0, mailesFormulas_1.sendVerificationEmail)(email, token);
        res.status(200).json({ message: "Reset password email sent successfully" });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.forgotPassword = forgotPassword;
