"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const signupController_1 = require("../controllers/signupController");
const loginController_1 = require("../controllers/loginController");
const forgotPasswordController_1 = require("../controllers/forgotPasswordController");
const forgotPasswordController_2 = require("../controllers/getReq/forgotPasswordController");
const resetPasswordController_1 = require("../controllers/getReq/resetPasswordController");
const router = express_1.default.Router();
router.post('/Signup', signupController_1.signup);
router.post('/Login', loginController_1.login);
router.post('/forgot-Password', forgotPasswordController_1.forgotPassword);
router.get('/forgot-Password', forgotPasswordController_2.forgotPasswordform);
router.get('/reset-Password', resetPasswordController_1.resetPassword);
exports.default = router;
