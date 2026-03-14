import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { validateDelivery } from '../services/inventoryService';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';

const deliveryItemSchema = z.object({
  productId: z.string().uuid(),
  locationId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const createDeliverySchema = z.object({
  customer: z.string().min(1),
  notes: z.string().optional(),
  status: z.enum(['DRAFT', 'WAITING', 'READY']).optional(),
  items: z.array(deliveryItemSchema).min(1),
});

export async function createDelivery(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createDeliverySchema.parse(req.body);

    const delivery = await prisma.delivery.create({
      data: {
        customer: data.customer,
        notes: data.notes,
        status: data.status ?? 'DRAFT',
        items: { create: data.items },
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

    res.status(201).json({ success: true, data: delivery });
  } catch (err) {
    next(err);
  }
}

export async function getDeliveries(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { ...(status && { status: status as any }) };

    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({
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
      prisma.delivery.count({ where }),
    ]);

    res.json({
      success: true,
      data: deliveries,
      meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getDelivery(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const delivery = await prisma.delivery.findUnique({
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

    if (!delivery) throw new AppError('Delivery not found', 404);
    res.json({ success: true, data: delivery });
  } catch (err) {
    next(err);
  }
}

export async function validateDeliveryHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await validateDelivery(id);
    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: { items: { include: { product: true, location: { include: { warehouse: true } } } } },
    });
    res.json({ success: true, message: 'Delivery validated — stock decremented', data: delivery });
  } catch (err) {
    next(err);
  }
}

export async function updateDeliveryStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = z.object({ status: z.enum(['DRAFT', 'WAITING', 'READY', 'CANCELED']) }).parse(req.body);

    const delivery = await prisma.delivery.findUnique({ where: { id } });
    if (!delivery) throw new AppError('Delivery not found', 404);
    if (delivery.status === 'DONE') throw new AppError('Cannot change status of a validated delivery', 422);

    const updated = await prisma.delivery.update({ where: { id }, data: { status } });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}
