import { Router } from 'express';
import { createPayment, getPayments, getPaymentById } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createPaymentSchema } from '../validators/paymentValidators.js';

const router = Router();

router.use(requireAuth);

router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.post('/', validateRequest(createPaymentSchema), createPayment);

export default router;
