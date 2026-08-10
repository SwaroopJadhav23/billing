import express from 'express';
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authRateLimiter, forgotPasswordRateLimiter } from '../middleware/authRateLimit.js';

const router = express.Router();

router.post('/login', authRateLimiter, login);
router.post('/refresh', authRateLimiter, refresh);
router.post('/forgot-password', forgotPasswordRateLimiter, forgotPassword);
router.post('/reset-password', authRateLimiter, resetPassword);
router.get('/me', protect, me);
router.post('/logout', protect, logout);
router.post('/change-password', protect, changePassword);

export default router;
