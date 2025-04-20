import express from 'express';
import { loginUser, registerUser,handleOAuthLogin } from '../Controllers/AuthController.js';

const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/oauth/google', handleOAuthLogin);



export default router;


