import { Router } from 'express';
import {
  createTransfer,
  getTransfers,
  getTransfer,
  completeTransferHandler,
} from '../controllers/transferController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getTransfers);
router.post('/', createTransfer);
router.get('/:id', getTransfer);
router.post('/:id/complete', requireRole('MANAGER'), completeTransferHandler);

export default router;
