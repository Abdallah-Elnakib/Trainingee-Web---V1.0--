import express, { Router } from 'express';
import { signup } from '../controllers/signupController';
import { login } from '../controllers/loginController';
import { forgotPassword } from '../controllers/forgotPasswordController';
import { forgotPasswordform} from '../controllers/getReq/forgotPasswordController';
import { resetPassword } from '../controllers/getReq/resetPasswordController';

const router: Router = express.Router();

router.post('/Signup', signup);


router.post('/Login', login);


router.post('/forgot-Password', forgotPassword);
router.get('/forgot-Password', forgotPasswordform);

router.get('/reset-Password', resetPassword);

export default router;