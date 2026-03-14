import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorMiddleware';

export async function getOrCreateStockLevel(
  productId: string,
  locationId: string,
  tx?: Prisma.TransactionClient
): Promise<{ id: string; quantity: number }> {
  const db = tx ?? prisma;
  const existing = await db.stockLevel.findUnique({
    where: { productId_locationId: { productId, locationId } },
  });
  if (existing) return existing;
  return db.stockLevel.create({ data: { productId, locationId, quantity: 0 } });
}

export async function increaseStock(
  productId: string,
  locationId: string,
  quantity: number,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx ?? prisma;
  await db.stockLevel.upsert({
    where: { productId_locationId: { productId, locationId } },
    update: { quantity: { increment: quantity } },
    create: { productId, locationId, quantity },
  });
}

export async function decreaseStock(
  productId: string,
  locationId: string,
  quantity: number,
  allowNegative: boolean = false,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx ?? prisma;

  if (!allowNegative) {
    const stock = await db.stockLevel.findUnique({
      where: { productId_locationId: { productId, locationId } },
    });
    const current = stock?.quantity ?? 0;
    if (current < quantity) {
      throw new AppError(
        `Insufficient stock. Available: ${current}, Requested: ${quantity}`,
        422,
        'INSUFFICIENT_STOCK'
      );
    }
  }

  await db.stockLevel.upsert({
    where: { productId_locationId: { productId, locationId } },
    update: { quantity: { decrement: quantity } },
    create: { productId, locationId, quantity: -quantity },
  });
}

export async function adjustStock(
  productId: string,
  locationId: string,
  physicalCount: number,
  tx?: Prisma.TransactionClient
): Promise<number> {
  const db = tx ?? prisma;
  const stock = await db.stockLevel.findUnique({
    where: { productId_locationId: { productId, locationId } },
  });
  const systemQty = stock?.quantity ?? 0;
  const diff = physicalCount - systemQty;

  await db.stockLevel.upsert({
    where: { productId_locationId: { productId, locationId } },
    update: { quantity: physicalCount },
    create: { productId, locationId, quantity: physicalCount },
  });

  return diff;
}

export async function getStockByProduct(productId: string) {
  return prisma.stockLevel.findMany({
    where: { productId },
    include: {
      location: {
        include: { warehouse: true },
      },
    },
  });
}

export async function getLowStockItems() {
  const products = await prisma.product.findMany({
    include: {
      stockLevels: true,
    },
  });

  return products.filter((p) => {
    const total = p.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0);
    return total > 0 && total < p.reorderLevel;
  });
}

export async function getOutOfStockItems() {
  const products = await prisma.product.findMany({
    include: {
      stockLevels: true,
    },
  });

  return products.filter((p) => {
    const total = p.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0);
    return total === 0;
  });
}
