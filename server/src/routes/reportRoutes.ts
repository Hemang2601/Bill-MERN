import { Router } from 'express';
import {
  getSalesReport,
  getCustomerWiseReport,
  getProductWiseReport,
  getPaymentCollectionReport,
  exportInvoicesCsv,
} from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/sales', getSalesReport);
router.get('/customers', getCustomerWiseReport);
router.get('/products', getProductWiseReport);
router.get('/payments', getPaymentCollectionReport);
router.get('/export-csv', exportInvoicesCsv);

export default router;
