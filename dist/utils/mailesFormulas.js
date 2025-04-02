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
exports.sendVerificationEmail = sendVerificationEmail;
const mailSender_1 = __importDefault(require("./mailSender"));
function sendVerificationEmail(email, token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const resetPasswordUrl = `http://auth-service:3000/reset-password?token=${token}`;
            const mailResponse = yield (0, mailSender_1.default)(email, "Reset Password", `<h1>Reset Your Password</h1>
         <p>Click the button below to reset your password:</p>
         <a href="${resetPasswordUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: blue; text-decoration: none; border-radius: 5px;">Reset Password</a>`);
        }
        catch (error) {
            console.log("Error occurred while sending email: ", error);
            throw error;
        }
    });
}
