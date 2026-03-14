import { Router } from 'express';
import {
  createWarehouse,
  getWarehouses,
  getWarehouse,
  updateWarehouse,
  createLocation,
  getLocations,
} from '../controllers/warehouseController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getWarehouses);
router.post('/', requireRole('MANAGER'), createWarehouse);
router.get('/:id', getWarehouse);
router.patch('/:id', requireRole('MANAGER'), updateWarehouse);

router.get('/meta/locations', getLocations);
router.post('/meta/locations', requireRole('MANAGER'), createLocation);

export default router;
