import express, { Router } from 'express';
import { signup } from '../controllers/authControllers/postReq/signupController';
import { login } from '../controllers/authControllers/postReq/loginController';
import { forgotPassword } from '../controllers/authControllers/postReq/forgotPasswordController';
import { forgotPasswordform} from '../controllers/authControllers/getReq/forgotPasswordController';
import { resetPassword } from '../controllers/authControllers/getReq/resetPasswordController';
import { loginForm } from '../controllers/authControllers/getReq/loginController';
import { resetPasswordInDatabase } from '../controllers/authControllers/postReq/resetPasswordController';

const router: Router = express.Router();

router.post('/Signup', signup);


router.post('/Login', login);
router.get('/Login', loginForm);

router.post('/forgot-Password', forgotPassword);
router.get('/forgot-Password', forgotPasswordform);

router.get('/reset-Password', resetPassword);
router.post('/reset-Password', resetPasswordInDatabase);

export default router;