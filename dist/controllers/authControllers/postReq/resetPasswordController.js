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
exports.resetPasswordInDatabase = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = require("../../../models/userModel");
const resetPasswordInDatabase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { newPassword, confirmPassword } = req.body;
        const { token } = req.query;
        if (!newPassword || !confirmPassword) {
            res.status(400).json({ message: 'New password and confirm password are required' });
            return;
        }
        if (newPassword !== confirmPassword) {
            res.status(400).json({ message: 'Passwords do not match' });
            return;
        }
        if (newPassword.length < 8) {
            res.status(400).json({ message: 'Password must be at least 8 characters' });
            return;
        }
        const user = yield userModel_1.Users.findOne({ resetPasswordToken: token });
        if (!user) {
            res.status(400).json({ message: 'Invalid token' });
            return;
        }
        jsonwebtoken_1.default.verify(token, process.env.RESET_PASSWORD_SECRET, (err, decoded) => {
            if (err) {
                res.status(400).json({ message: 'Invalid token' });
                return;
            }
        });
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        yield userModel_1.Users.updateOne({ _id: user._id }, { $set: { password: hashedPassword, resetPasswordToken: null } });
        res.status(200).json({ message: 'Password reset successfully' });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.resetPasswordInDatabase = resetPasswordInDatabase;
