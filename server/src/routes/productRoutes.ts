import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { productSchema, productUpdateSchema } from '../validators/productValidators.js';

const router = Router();

router.use(requireAuth);

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', validateRequest(productSchema), createProduct);
router.patch('/:id', validateRequest(productUpdateSchema), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
