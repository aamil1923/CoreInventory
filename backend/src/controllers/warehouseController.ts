import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';

const warehouseSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
});

const locationSchema = z.object({
  name: z.string().min(1),
  warehouseId: z.string().uuid(),
});

export async function createWarehouse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = warehouseSchema.parse(req.body);
    const warehouse = await prisma.warehouse.create({ data });
    res.status(201).json({ success: true, data: warehouse });
  } catch (err) {
    next(err);
  }
}

export async function getWarehouses(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        locations: {
          include: {
            stockLevels: {
              include: { product: { select: { id: true, name: true, sku: true } } },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: warehouses });
  } catch (err) {
    next(err);
  }
}

export async function getWarehouse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        locations: {
          include: {
            stockLevels: {
              include: { product: true },
            },
          },
        },
      },
    });
    if (!warehouse) throw new AppError('Warehouse not found', 404);
    res.json({ success: true, data: warehouse });
  } catch (err) {
    next(err);
  }
}

export async function updateWarehouse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const data = warehouseSchema.partial().parse(req.body);
    const existing = await prisma.warehouse.findUnique({ where: { id } });
    if (!existing) throw new AppError('Warehouse not found', 404);
    const updated = await prisma.warehouse.update({ where: { id }, data });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function createLocation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = locationSchema.parse(req.body);
    const warehouse = await prisma.warehouse.findUnique({ where: { id: data.warehouseId } });
    if (!warehouse) throw new AppError('Warehouse not found', 404);
    const location = await prisma.location.create({
      data,
      include: { warehouse: true },
    });
    res.status(201).json({ success: true, data: location });
  } catch (err) {
    next(err);
  }
}

export async function getLocations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { warehouseId } = req.query as Record<string, string>;
    const locations = await prisma.location.findMany({
      where: warehouseId ? { warehouseId } : undefined,
      include: { warehouse: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: locations });
  } catch (err) {
    next(err);
  }
}
