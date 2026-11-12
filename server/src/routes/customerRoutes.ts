import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { customerSchema, customerUpdateSchema } from '../validators/customerValidators.js';

const router = Router();

router.use(requireAuth);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', validateRequest(customerSchema), createCustomer);
router.patch('/:id', validateRequest(customerUpdateSchema), updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
