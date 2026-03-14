import { MovementType, Prisma } from '@prisma/client';
import prisma from '../config/database';

export interface LedgerEntry {
  productId: string;
  locationId: string;
  movementType: MovementType;
  quantityChange: number;
  referenceId: string;
}

export async function createLedgerEntry(
  entry: LedgerEntry,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx ?? prisma;
  await db.inventoryLedger.create({ data: entry });
}

export async function createLedgerEntries(
  entries: LedgerEntry[],
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx ?? prisma;
  await db.inventoryLedger.createMany({ data: entries });
}

export async function getLedger(filters: {
  productId?: string;
  locationId?: string;
  movementType?: MovementType;
  page?: number;
  limit?: number;
}) {
  const { productId, locationId, movementType, page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.InventoryLedgerWhereInput = {
    ...(productId && { productId }),
    ...(locationId && { locationId }),
    ...(movementType && { movementType }),
  };

  const [entries, total] = await Promise.all([
    prisma.inventoryLedger.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        location: {
          select: {
            id: true,
            name: true,
            warehouse: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.inventoryLedger.count({ where }),
  ]);

  return { entries, total, page, limit, pages: Math.ceil(total / limit) };
}
