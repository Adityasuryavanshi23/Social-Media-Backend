import express from 'express';
import { googleAuth, googleAuthCallback, loginUser, logoutUser, registerUser } from '../Controllers/AuthController.js';

const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);

router.get("/google",googleAuth)
router.get("/google/callback",googleAuthCallback)
router.get("/logout",logoutUser)

export default router;


