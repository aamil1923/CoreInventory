import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { validateReceipt } from '../services/inventoryService';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';

const receiptItemSchema = z.object({
  productId: z.string().uuid(),
  locationId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const createReceiptSchema = z.object({
  supplier: z.string().min(1),
  notes: z.string().optional(),
  status: z.enum(['DRAFT', 'WAITING', 'READY']).optional(),
  items: z.array(receiptItemSchema).min(1),
});

export async function createReceipt(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createReceiptSchema.parse(req.body);

    const receipt = await prisma.receipt.create({
      data: {
        supplier: data.supplier,
        notes: data.notes,
        status: data.status ?? 'DRAFT',
        items: {
          create: data.items,
        },
      },
      include: {
        items: {
          include: {
            product: true,
            location: { include: { warehouse: true } },
          },
        },
      },
    });

    res.status(201).json({ success: true, data: receipt });
  } catch (err) {
    next(err);
  }
}

export async function getReceipts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { ...(status && { status: status as any }) };

    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
              location: { include: { warehouse: { select: { id: true, name: true } } } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.receipt.count({ where }),
    ]);

    res.json({
      success: true,
      data: receipts,
      meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getReceipt(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            location: { include: { warehouse: true } },
          },
        },
      },
    });

    if (!receipt) throw new AppError('Receipt not found', 404);
    res.json({ success: true, data: receipt });
  } catch (err) {
    next(err);
  }
}

export async function validateReceiptHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await validateReceipt(id);
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: { items: { include: { product: true, location: { include: { warehouse: true } } } } },
    });
    res.json({ success: true, message: 'Receipt validated — stock updated', data: receipt });
  } catch (err) {
    next(err);
  }
}

export async function updateReceiptStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = z.object({ status: z.enum(['DRAFT', 'WAITING', 'READY', 'CANCELED']) }).parse(req.body);

    const receipt = await prisma.receipt.findUnique({ where: { id } });
    if (!receipt) throw new AppError('Receipt not found', 404);
    if (receipt.status === 'DONE') throw new AppError('Cannot change status of a validated receipt', 422);

    const updated = await prisma.receipt.update({ where: { id }, data: { status } });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}
