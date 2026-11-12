import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/business', getSettings);
router.patch('/business', updateSettings);

export default router;
