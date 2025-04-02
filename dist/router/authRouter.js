"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const signupController_1 = require("../controllers/signupController");
const loginController_1 = require("../controllers/loginController");
const resetPasswordController_1 = require("../controllers/resetPasswordController");
const router = express_1.default.Router();
router.post('/Signup', signupController_1.signup);
router.post('/Login', loginController_1.login);
router.post('/Reset-Password', resetPasswordController_1.resetPassword);
exports.default = router;
