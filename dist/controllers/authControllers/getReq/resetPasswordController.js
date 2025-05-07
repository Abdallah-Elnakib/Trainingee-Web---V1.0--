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
exports.resetPassword = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = require("../../../models/userModel");
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.query;
        if (!token) {
            res.status(400).render('error', { message: 'Password reset token is required' });
            return;
        }
        // Check if user with this token exists
        const user = yield userModel_1.Users.findOne({ resetPasswordToken: token });
        if (!user) {
            res.status(400).render('resetPassword.ejs', { tokenError: true });
            return;
        }
        // Verify JWT token
        try {
            jsonwebtoken_1.default.verify(token, process.env.RESET_PASSWORD_SECRET);
        }
        catch (error) {
            res.status(400).render('resetPassword.ejs', { tokenError: true });
            return;
        }
        // If all validations pass, render reset password page
        res.status(200).render('resetPassword.ejs', { tokenError: false });
        return;
    }
    catch (error) {
        console.error('Error in reset password GET controller:', error);
        res.status(500).render('error', { message: 'An unexpected error occurred' });
        return;
    }
});
exports.resetPassword = resetPassword;
