import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
} from '../controllers/productController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getProducts);
router.post('/', requireRole('MANAGER'), createProduct);
router.get('/:id', getProduct);
router.put('/:id', requireRole('MANAGER'), updateProduct);
router.delete('/:id', requireRole('MANAGER'), deleteProduct);

// Categories
router.get('/meta/categories', getCategories);
router.post('/meta/categories', requireRole('MANAGER'), createCategory);

export default router;
