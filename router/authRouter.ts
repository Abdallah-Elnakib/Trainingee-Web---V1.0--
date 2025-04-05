import express, { Router } from 'express';
import { signup } from '../controllers/authControllers/postReq/signupController';
import { login } from '../controllers/authControllers/postReq/loginController';
import { forgotPassword } from '../controllers/authControllers/postReq/forgotPasswordController';
import { forgotPasswordform} from '../controllers/authControllers/getReq/forgotPasswordController';
import { resetPassword } from '../controllers/authControllers/getReq/resetPasswordController';
import { loginForm } from '../controllers/authControllers/getReq/loginController';
import { resetPasswordInDatabase } from '../controllers/authControllers/postReq/resetPasswordController';
import { home } from '../controllers/authControllers/getReq/homeController';
import { logout } from '../controllers/authControllers/getReq/logoutController';
import { verifyJWT } from '../middleware/verifyJWT';

const router: Router = express.Router();

router.post('/Signup', signup);


router.post('/Login', login);
router.get('/Login', loginForm);

router.get('/logout', logout);


router.post('/forgot-Password', forgotPassword);
router.get('/forgot-Password', forgotPasswordform);

router.get('/reset-Password', resetPassword);
router.post('/reset-Password', resetPasswordInDatabase);


router.use(verifyJWT); // Middleware to verify JWT for all routes below this line
router.get('/home', home)


export default router;