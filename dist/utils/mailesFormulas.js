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
            const resetPasswordUrl = `http://127.0.0.1:3000/api/auth/reset-password?token=${token}`;
            const mailResponse = yield (0, mailSender_1.default)({
                to: email,
                from: `Trainingee <${process.env.EMAIL_USER}>`,
                subject: 'Trainingee - Reset Your Password',
                html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Trainingee Password</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
                
                body {
                    font-family: 'Poppins', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f7f9fc;
                }
                
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }
                
                .email-header {
                    background-color: #4f46e5;
                    padding: 24px;
                    text-align: center;
                    color: white;
                }
                
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 6px;
                }
                
                .tagline {
                    font-size: 14px;
                    opacity: 0.9;
                }
                
                .email-body {
                    padding: 32px 24px;
                }
                
                .greeting {
                    font-size: 22px;
                    font-weight: 600;
                    margin-bottom: 16px;
                    color: white;
                }
                
                .reset-password-button {
                    display: inline-block;
                    padding: 14px 36px;
                    font-size: 18px;
                    font-weight: 700;
                    color: white;
                    background-color: #4f46e5;
                    text-decoration: none;
                    border-radius: 6px;
                    margin: 24px 0;
                    text-align: center;
                    transition: background-color 0.3s;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                    letter-spacing: 0.5px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                .reset-password-button:hover {
                    background-color: #3730a3;
                }
                
                .instructions {
                    margin-bottom: 24px;
                }
                
                .alternative {
                    font-size: 14px;
                    color: #666;
                    margin-top: 24px;
                    padding-top: 16px;
                    border-top: 1px solid #eee;
                }
                
                .manual-link {
                    word-break: break-all;
                    color: #4f46e5;
                }
                
                .footer {
                    background-color: #f7f9fc;
                    padding: 24px;
                    text-align: center;
                    font-size: 13px;
                    color: #777;
                }
                
                .security-note {
                    font-size: 12px;
                    color: #999;
                    margin-top: 16px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <div class="logo">Trainingee</div>
                    <div class="tagline">Student Management System</div>
                </div>
                
                <div class="email-body">
                    <div class="greeting">Reset Your Password</div>
                    
                    <p class="instructions">
                        You've requested to reset your password for your Trainingee account. Click the button below to create a new password. If you didn't request this change, you can safely ignore this email.
                    </p>
                    
                    <a href="${resetPasswordUrl}" class="reset-password-button">Reset Password</a>
                    
                    <p class="alternative">
                        If the button above doesn't work, paste this link into your browser:<br>
                        <a href="${resetPasswordUrl}" class="manual-link">${resetPasswordUrl}</a>
                    </p>
                    
                    <p class="security-note">
                        This password reset link will expire in 1 hour for security reasons. If your link has expired, you can request a new one.
                    </p>
                </div>
                
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Trainingee. All rights reserved.</p>
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        `
            });
        }
        catch (error) {
            console.log("Error occurred while sending email: ", error);
            throw error;
        }
    });
}
