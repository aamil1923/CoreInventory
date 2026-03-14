import { Router } from 'express';
import { createAdjustment, getAdjustments } from '../controllers/adjustmentController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getAdjustments);
router.post('/', requireRole('MANAGER'), createAdjustment);

export default router;
