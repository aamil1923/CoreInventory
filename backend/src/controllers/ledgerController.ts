import { Response, NextFunction } from 'express';
import { getLedger } from '../services/ledgerService';
import { AuthRequest } from '../middleware/authMiddleware';
import { MovementType } from '@prisma/client';

export async function getLedgerHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { productId, locationId, movementType, page, limit } = req.query as Record<string, string>;

    const result = await getLedger({
      productId,
      locationId,
      movementType: movementType as MovementType | undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
