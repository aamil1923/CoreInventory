import prisma from '../config/database';
import { increaseStock, decreaseStock, adjustStock } from './stockService';
import { createLedgerEntries } from './ledgerService';
import { AppError } from '../middleware/errorMiddleware';

export async function validateReceipt(receiptId: string): Promise<void> {
  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
    include: { items: true },
  });

  if (!receipt) throw new AppError('Receipt not found', 404);
  if (receipt.status === 'DONE') throw new AppError('Receipt already validated', 409);
  if (receipt.status === 'CANCELED') throw new AppError('Cannot validate a canceled receipt', 422);

  await prisma.$transaction(async (tx) => {
    for (const item of receipt.items) {
      await increaseStock(item.productId, item.locationId, item.quantity, tx);
    }

    await createLedgerEntries(
      receipt.items.map((item) => ({
        productId: item.productId,
        locationId: item.locationId,
        movementType: 'RECEIPT' as const,
        quantityChange: item.quantity,
        referenceId: receipt.id,
      })),
      tx
    );

    await tx.receipt.update({
      where: { id: receiptId },
      data: { status: 'DONE' },
    });
  });
}

export async function validateDelivery(deliveryId: string): Promise<void> {
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    include: { items: true },
  });

  if (!delivery) throw new AppError('Delivery not found', 404);
  if (delivery.status === 'DONE') throw new AppError('Delivery already validated', 409);
  if (delivery.status === 'CANCELED') throw new AppError('Cannot validate a canceled delivery', 422);

  await prisma.$transaction(async (tx) => {
    for (const item of delivery.items) {
      await decreaseStock(item.productId, item.locationId, item.quantity, false, tx);
    }

    await createLedgerEntries(
      delivery.items.map((item) => ({
        productId: item.productId,
        locationId: item.locationId,
        movementType: 'DELIVERY' as const,
        quantityChange: -item.quantity,
        referenceId: delivery.id,
      })),
      tx
    );

    await tx.delivery.update({
      where: { id: deliveryId },
      data: { status: 'DONE' },
    });
  });
}

export async function completeTransfer(transferId: string): Promise<void> {
  const transfer = await prisma.transfer.findUnique({
    where: { id: transferId },
    include: { items: true },
  });

  if (!transfer) throw new AppError('Transfer not found', 404);
  if (transfer.status === 'DONE') throw new AppError('Transfer already completed', 409);
  if (transfer.status === 'CANCELED') throw new AppError('Cannot complete a canceled transfer', 422);

  await prisma.$transaction(async (tx) => {
    for (const item of transfer.items) {
      await decreaseStock(item.productId, item.sourceLocationId, item.quantity, false, tx);
      await increaseStock(item.productId, item.destinationLocationId, item.quantity, tx);
    }

    const ledgerEntries = transfer.items.flatMap((item) => [
      {
        productId: item.productId,
        locationId: item.sourceLocationId,
        movementType: 'TRANSFER' as const,
        quantityChange: -item.quantity,
        referenceId: transfer.id,
      },
      {
        productId: item.productId,
        locationId: item.destinationLocationId,
        movementType: 'TRANSFER' as const,
        quantityChange: item.quantity,
        referenceId: transfer.id,
      },
    ]);

    await createLedgerEntries(ledgerEntries, tx);

    await tx.transfer.update({
      where: { id: transferId },
      data: { status: 'DONE' },
    });
  });
}

export async function recordAdjustment(data: {
  productId: string;
  locationId: string;
  physicalCount: number;
  reason: string;
}): Promise<void> {
  const { productId, locationId, physicalCount, reason } = data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found', 404);

  const location = await prisma.location.findUnique({ where: { id: locationId } });
  if (!location) throw new AppError('Location not found', 404);

  await prisma.$transaction(async (tx) => {
    const diff = await adjustStock(productId, locationId, physicalCount, tx);

    const currentStock = await tx.stockLevel.findUnique({
      where: { productId_locationId: { productId, locationId } },
    });

    await tx.adjustment.create({
      data: {
        productId,
        locationId,
        systemQuantity: (currentStock?.quantity ?? physicalCount) - diff,
        physicalCount,
        quantityChange: diff,
        reason,
      },
    });

    await createLedgerEntries(
      [
        {
          productId,
          locationId,
          movementType: 'ADJUSTMENT' as const,
          quantityChange: diff,
          referenceId: `ADJ-${Date.now()}`,
        },
      ],
      tx
    );
  });
}
