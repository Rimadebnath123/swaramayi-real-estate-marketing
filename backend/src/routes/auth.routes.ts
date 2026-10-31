import { Router } from 'express';
import { 
  login, 
  verifyMFA, 
  bindDevice,
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPasswordWithOTP
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/mfa/verify', verifyMFA);
router.post('/device/bind', verifyToken, bindDevice);

// Password Reset via Google Gmail OTP
router.post('/forgot-password/send-otp', sendPasswordResetOTP);
router.post('/forgot-password/verify-otp', verifyPasswordResetOTP);
router.post('/forgot-password/reset', resetPasswordWithOTP);

export default router;
