import { Router } from 'express';
import {
  createDelivery,
  getDeliveries,
  getDelivery,
  validateDeliveryHandler,
  updateDeliveryStatus,
} from '../controllers/deliveryController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getDeliveries);
router.post('/', createDelivery);
router.get('/:id', getDelivery);
router.patch('/:id/status', updateDeliveryStatus);
router.post('/:id/validate', requireRole('MANAGER'), validateDeliveryHandler);

export default router;
