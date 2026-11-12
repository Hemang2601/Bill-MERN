import { Router } from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getInvoicePdf,
  regenerateInvoicePdf,
} from '../controllers/invoiceController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createInvoiceSchema, updateInvoiceSchema } from '../validators/invoiceValidators.js';

const router = Router();

// Publicly or session-protected PDF view
router.get('/:id/pdf', getInvoicePdf);

router.use(requireAuth);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', validateRequest(createInvoiceSchema), createInvoice);
router.patch('/:id', validateRequest(updateInvoiceSchema), updateInvoice);
router.delete('/:id', deleteInvoice);
router.post('/:id/regenerate-pdf', regenerateInvoicePdf);

export default router;
