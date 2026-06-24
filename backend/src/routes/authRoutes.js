import express from 'express';
import { forgotPassword, login, me, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, me);
router.post('/logout', protect, (req, res) => res.json({ message: 'Logged out' }));

export default router;
