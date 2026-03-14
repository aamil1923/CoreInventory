import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { completeTransfer } from '../services/inventoryService';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';

const transferItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  sourceLocationId: z.string().uuid(),
  destinationLocationId: z.string().uuid(),
}).refine((d) => d.sourceLocationId !== d.destinationLocationId, {
  message: 'Source and destination locations must be different',
});

const createTransferSchema = z.object({
  notes: z.string().optional(),
  items: z.array(transferItemSchema).min(1),
});

export async function createTransfer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createTransferSchema.parse(req.body);

    const transfer = await prisma.transfer.create({
      data: {
        notes: data.notes,
        status: 'WAITING',
        items: { create: data.items },
      },
      include: {
        items: {
          include: {
            product: true,
            sourceLocation: { include: { warehouse: true } },
            destinationLocation: { include: { warehouse: true } },
          },
        },
      },
    });

    res.status(201).json({ success: true, data: transfer });
  } catch (err) {
    next(err);
  }
}

export async function getTransfers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { ...(status && { status: status as any }) };

    const [transfers, total] = await Promise.all([
      prisma.transfer.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
              sourceLocation: { include: { warehouse: { select: { id: true, name: true } } } },
              destinationLocation: { include: { warehouse: { select: { id: true, name: true } } } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transfer.count({ where }),
    ]);

    res.json({
      success: true,
      data: transfers,
      meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getTransfer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            sourceLocation: { include: { warehouse: true } },
            destinationLocation: { include: { warehouse: true } },
          },
        },
      },
    });

    if (!transfer) throw new AppError('Transfer not found', 404);
    res.json({ success: true, data: transfer });
  } catch (err) {
    next(err);
  }
}

export async function completeTransferHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await completeTransfer(id);
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            sourceLocation: { include: { warehouse: true } },
            destinationLocation: { include: { warehouse: true } },
          },
        },
      },
    });
    res.json({ success: true, message: 'Transfer completed — stock relocated', data: transfer });
  } catch (err) {
    next(err);
  }
}
