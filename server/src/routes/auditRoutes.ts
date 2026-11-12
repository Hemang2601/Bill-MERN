import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getAuditLogs);

export default router;
