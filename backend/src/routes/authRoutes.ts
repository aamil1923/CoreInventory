import { Router } from 'express';
import { signup, login, requestReset, verifyOtp } from '../controllers/authController';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/request-reset', requestReset);
router.post('/verify-otp', verifyOtp);

export default router;
