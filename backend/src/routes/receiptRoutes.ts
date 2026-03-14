import { Router } from 'express';
import {
  createReceipt,
  getReceipts,
  getReceipt,
  validateReceiptHandler,
  updateReceiptStatus,
} from '../controllers/receiptController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getReceipts);
router.post('/', createReceipt);
router.get('/:id', getReceipt);
router.patch('/:id/status', updateReceiptStatus);
router.post('/:id/validate', requireRole('MANAGER'), validateReceiptHandler);

export default router;
