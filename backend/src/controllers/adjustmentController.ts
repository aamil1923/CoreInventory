import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { recordAdjustment } from '../services/inventoryService';
import { AuthRequest } from '../middleware/authMiddleware';

const createAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  locationId: z.string().uuid(),
  physicalCount: z.number().int().min(0),
  reason: z.string().min(1),
});

export async function createAdjustment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createAdjustmentSchema.parse(req.body);
    await recordAdjustment(data);

    const adjustment = await prisma.adjustment.findFirst({
      where: { productId: data.productId, locationId: data.locationId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
        location: { include: { warehouse: true } },
      },
    });

    res.status(201).json({ success: true, message: 'Adjustment recorded', data: adjustment });
  } catch (err) {
    next(err);
  }
}

export async function getAdjustments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { productId, locationId, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(productId && { productId }),
      ...(locationId && { locationId }),
    };

    const [adjustments, total] = await Promise.all([
      prisma.adjustment.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          product: { select: { id: true, name: true, sku: true } },
          location: { include: { warehouse: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.adjustment.count({ where }),
    ]);

    res.json({
      success: true,
      data: adjustments,
      meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}
