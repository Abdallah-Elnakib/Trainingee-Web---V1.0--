import express, { Router } from 'express';
import { signup } from '../controllers/signupController';
import { login } from '../controllers/loginController';
import { resetPassword } from '../controllers/resetPasswordController';

const router: Router = express.Router();

router.post('/Signup', signup);
router.post('/Login', login);
router.post('/Reset-Password', resetPassword);

export default router;