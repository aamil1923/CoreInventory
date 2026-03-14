import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { getLowStockItems, getOutOfStockItems } from '../services/stockService';
import { AuthRequest } from '../middleware/authMiddleware';

export async function getDashboardKpis(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      totalProducts,
      pendingReceipts,
      pendingDeliveries,
      pendingTransfers,
      lowStockItems,
      outOfStockItems,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.receipt.count({ where: { status: { in: ['WAITING', 'READY'] } } }),
      prisma.delivery.count({ where: { status: { in: ['WAITING', 'READY'] } } }),
      prisma.transfer.count({ where: { status: { in: ['WAITING', 'READY'] } } }),
      getLowStockItems(),
      getOutOfStockItems(),
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        lowStockItems: lowStockItems.length,
        outOfStockItems: outOfStockItems.length,
        pendingReceipts,
        pendingDeliveries,
        pendingTransfers,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getRecentActivity(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const [receipts, deliveries, transfers] = await Promise.all([
      prisma.receipt.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, supplier: true, status: true, createdAt: true },
      }),
      prisma.delivery.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, customer: true, status: true, createdAt: true },
      }),
      prisma.transfer.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true, createdAt: true },
      }),
    ]);

    const activity = [
      ...receipts.map((r) => ({ ...r, type: 'RECEIPT', party: r.supplier })),
      ...deliveries.map((d) => ({ ...d, type: 'DELIVERY', party: d.customer })),
      ...transfers.map((t) => ({ ...t, type: 'TRANSFER', party: null })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    res.json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
}

export async function getStockAlerts(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const [low, out] = await Promise.all([getLowStockItems(), getOutOfStockItems()]);

    res.json({
      success: true,
      data: {
        lowStock: low.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          reorderLevel: p.reorderLevel,
          totalStock: p.stockLevels.reduce((s, sl) => s + sl.quantity, 0),
        })),
        outOfStock: out.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          reorderLevel: p.reorderLevel,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}
