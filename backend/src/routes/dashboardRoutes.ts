import { Router } from 'express';
import { getDashboardKpis, getRecentActivity, getStockAlerts } from '../controllers/dashboardController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/kpis', getDashboardKpis);
router.get('/activity', getRecentActivity);
router.get('/alerts', getStockAlerts);

export default router;
