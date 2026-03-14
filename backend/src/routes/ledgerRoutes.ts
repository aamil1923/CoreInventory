import { Router } from 'express';
import { getLedgerHandler } from '../controllers/ledgerController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getLedgerHandler);

export default router;
