import { Router } from 'express';
import { login, logout, getMe, changePassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { loginSchema, changePasswordSchema } from '../validators/authValidators.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.post('/change-password', requireAuth, validateRequest(changePasswordSchema), changePassword);

export default router;
