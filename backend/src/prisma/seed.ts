import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CoreInventory database...');

  // ── Users ──────────────────────────────────────────────────────────────────
  const managerPassword = await bcrypt.hash('manager123', 12);
  const staffPassword = await bcrypt.hash('staff123', 12);

  const manager = await prisma.user.upsert({
    where: { email: 'manager@coreinventory.io' },
    update: {},
    create: {
      name: 'Alex Chen',
      email: 'manager@coreinventory.io',
      password: managerPassword,
      role: 'MANAGER',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@coreinventory.io' },
    update: {},
    create: {
      name: 'Jordan Lee',
      email: 'staff@coreinventory.io',
      password: staffPassword,
      role: 'WAREHOUSE',
    },
  });

  console.log(`  ✔ Users: ${manager.email}, ${staff.email}`);

  // ── Categories ─────────────────────────────────────────────────────────────
  const categoryNames = [
    'Raw Materials',
    'Furniture',
    'Electronics',
    'Packaging',
    'Machinery',
    'Safety',
  ];

  const categories: Record<string, { id: string; name: string }> = {};
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories[name] = cat;
  }
  console.log(`  ✔ ${categoryNames.length} categories`);

  // ── Warehouses & Locations ─────────────────────────────────────────────────
  const mainWh = await prisma.warehouse.create({
    data: {
      name: 'Main Warehouse',
      location: 'Block A, Industrial Park',
      locations: {
        create: [
          { name: 'Rack A-1' },
          { name: 'Rack A-2' },
          { name: 'Rack B-1' },
          { name: 'Bulk Storage' },
        ],
      },
    },
    include: { locations: true },
  });

  const coldWh = await prisma.warehouse.create({
    data: {
      name: 'Cold Storage',
      location: 'Block B, Industrial Park',
      locations: {
        create: [{ name: 'Zone 1' }, { name: 'Zone 2' }],
      },
    },
    include: { locations: true },
  });

  const prodFloor = await prisma.warehouse.create({
    data: {
      name: 'Production Floor',
      location: 'Building C',
      locations: {
        create: [{ name: 'Assembly Line 1' }, { name: 'Assembly Line 2' }],
      },
    },
    include: { locations: true },
  });

  const loc = {
    rackA1: mainWh.locations[0],
    rackA2: mainWh.locations[1],
    rackB1: mainWh.locations[2],
    bulk: mainWh.locations[3],
    coldZ1: coldWh.locations[0],
    coldZ2: coldWh.locations[1],
    al1: prodFloor.locations[0],
    al2: prodFloor.locations[1],
  };

  console.log(`  ✔ 3 warehouses, ${mainWh.locations.length + coldWh.locations.length + prodFloor.locations.length} locations`);

  // ── Products ───────────────────────────────────────────────────────────────
  const productData = [
    { name: 'Steel Rods 10mm', sku: 'SR-010', categoryId: categories['Raw Materials'].id, unitOfMeasure: 'pcs', reorderLevel: 50 },
    { name: 'Office Chair - Ergonomic', sku: 'OC-ERG', categoryId: categories['Furniture'].id, unitOfMeasure: 'pcs', reorderLevel: 20 },
    { name: 'Laptop Stand', sku: 'LS-001', categoryId: categories['Electronics'].id, unitOfMeasure: 'pcs', reorderLevel: 10 },
    { name: 'Packing Tape 50m', sku: 'PT-050', categoryId: categories['Packaging'].id, unitOfMeasure: 'rolls', reorderLevel: 30 },
    { name: 'Hydraulic Pump A4', sku: 'HP-A4', categoryId: categories['Machinery'].id, unitOfMeasure: 'pcs', reorderLevel: 5 },
    { name: 'Safety Gloves L', sku: 'SG-LRG', categoryId: categories['Safety'].id, unitOfMeasure: 'pairs', reorderLevel: 40 },
    { name: 'Copper Wire 2.5mm', sku: 'CW-25', categoryId: categories['Raw Materials'].id, unitOfMeasure: 'm', reorderLevel: 200 },
    { name: 'Industrial Fan 24V', sku: 'IF-24V', categoryId: categories['Electronics'].id, unitOfMeasure: 'pcs', reorderLevel: 5 },
  ];

  const products: Record<string, { id: string }> = {};
  for (const p of productData) {
    const prod = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
    products[p.sku] = prod;
  }
  console.log(`  ✔ ${productData.length} products`);

  // ── Stock Levels ───────────────────────────────────────────────────────────
  const stockData = [
    { productId: products['SR-010'].id, locationId: loc.rackA1.id, quantity: 247 },
    { productId: products['OC-ERG'].id, locationId: loc.rackB1.id, quantity: 18 },
    { productId: products['LS-001'].id, locationId: loc.rackA2.id, quantity: 0 },
    { productId: products['PT-050'].id, locationId: loc.bulk.id, quantity: 5 },
    { productId: products['HP-A4'].id, locationId: loc.rackA1.id, quantity: 7 },
    { productId: products['HP-A4'].id, locationId: loc.al1.id, quantity: 5 },
    { productId: products['SG-LRG'].id, locationId: loc.rackB1.id, quantity: 89 },
    { productId: products['CW-25'].id, locationId: loc.bulk.id, quantity: 1240 },
    { productId: products['IF-24V'].id, locationId: loc.coldZ1.id, quantity: 7 },
  ];

  for (const s of stockData) {
    await prisma.stockLevel.upsert({
      where: { productId_locationId: { productId: s.productId, locationId: s.locationId } },
      update: { quantity: s.quantity },
      create: s,
    });
  }
  console.log(`  ✔ ${stockData.length} stock level records`);

  // ── Receipts ───────────────────────────────────────────────────────────────
  const receipt1 = await prisma.receipt.create({
    data: {
      supplier: 'MetalCorp Ltd',
      status: 'DONE',
      notes: 'Regular monthly order',
      items: {
        create: [
          { productId: products['SR-010'].id, locationId: loc.rackA1.id, quantity: 100 },
          { productId: products['CW-25'].id, locationId: loc.bulk.id, quantity: 500 },
        ],
      },
    },
  });

  await prisma.receipt.create({
    data: {
      supplier: 'Office World',
      status: 'WAITING',
      items: {
        create: [
          { productId: products['OC-ERG'].id, locationId: loc.rackB1.id, quantity: 30 },
          { productId: products['SG-LRG'].id, locationId: loc.rackB1.id, quantity: 50 },
        ],
      },
    },
  });

  await prisma.receipt.create({
    data: {
      supplier: 'TechSupply Co',
      status: 'READY',
      items: {
        create: [
          { productId: products['LS-001'].id, locationId: loc.rackA2.id, quantity: 20 },
          { productId: products['IF-24V'].id, locationId: loc.coldZ1.id, quantity: 10 },
        ],
      },
    },
  });

  await prisma.receipt.create({
    data: {
      supplier: 'SafetyFirst Inc',
      status: 'DRAFT',
      items: {
        create: [{ productId: products['SG-LRG'].id, locationId: loc.rackB1.id, quantity: 100 }],
      },
    },
  });

  console.log('  ✔ 4 receipts');

  // ── Deliveries ─────────────────────────────────────────────────────────────
  await prisma.delivery.create({
    data: {
      customer: 'Acme Corp',
      status: 'DONE',
      items: {
        create: [{ productId: products['SR-010'].id, locationId: loc.rackA1.id, quantity: 50 }],
      },
    },
  });

  await prisma.delivery.create({
    data: {
      customer: 'Global Logistics',
      status: 'READY',
      items: {
        create: [{ productId: products['HP-A4'].id, locationId: loc.rackA1.id, quantity: 3 }],
      },
    },
  });

  await prisma.delivery.create({
    data: {
      customer: 'Sunrise Mfg',
      status: 'WAITING',
      items: {
        create: [{ productId: products['CW-25'].id, locationId: loc.bulk.id, quantity: 200 }],
      },
    },
  });

  console.log('  ✔ 3 deliveries');

  // ── Transfers ──────────────────────────────────────────────────────────────
  await prisma.transfer.create({
    data: {
      status: 'DONE',
      notes: 'Move to production',
      items: {
        create: [{
          productId: products['HP-A4'].id,
          quantity: 5,
          sourceLocationId: loc.rackA1.id,
          destinationLocationId: loc.al1.id,
        }],
      },
    },
  });

  await prisma.transfer.create({
    data: {
      status: 'WAITING',
      items: {
        create: [{
          productId: products['LS-001'].id,
          quantity: 10,
          sourceLocationId: loc.rackA2.id,
          destinationLocationId: loc.coldZ2.id,
        }],
      },
    },
  });

  console.log('  ✔ 2 transfers');

  // ── Adjustments ────────────────────────────────────────────────────────────
  await prisma.adjustment.create({
    data: {
      productId: products['SR-010'].id,
      locationId: loc.rackA1.id,
      systemQuantity: 300,
      physicalCount: 247,
      quantityChange: -53,
      reason: 'Damaged goods found during cycle count',
    },
  });

  await prisma.adjustment.create({
    data: {
      productId: products['PT-050'].id,
      locationId: loc.bulk.id,
      systemQuantity: 8,
      physicalCount: 5,
      quantityChange: -3,
      reason: 'Count discrepancy after audit',
    },
  });

  console.log('  ✔ 2 adjustments');

  // ── Ledger (seed historical entries) ──────────────────────────────────────
  const ledgerEntries = [
    { productId: products['SR-010'].id, locationId: loc.rackA1.id, movementType: 'RECEIPT' as const, quantityChange: 100, referenceId: receipt1.id },
    { productId: products['CW-25'].id, locationId: loc.bulk.id, movementType: 'RECEIPT' as const, quantityChange: 500, referenceId: receipt1.id },
    { productId: products['SR-010'].id, locationId: loc.rackA1.id, movementType: 'DELIVERY' as const, quantityChange: -50, referenceId: 'DEL-ACME-001' },
    { productId: products['HP-A4'].id, locationId: loc.rackA1.id, movementType: 'TRANSFER' as const, quantityChange: -5, referenceId: 'TRF-PROD-001' },
    { productId: products['HP-A4'].id, locationId: loc.al1.id, movementType: 'TRANSFER' as const, quantityChange: 5, referenceId: 'TRF-PROD-001' },
    { productId: products['SR-010'].id, locationId: loc.rackA1.id, movementType: 'ADJUSTMENT' as const, quantityChange: -53, referenceId: 'ADJ-CYCLE-001' },
    { productId: products['PT-050'].id, locationId: loc.bulk.id, movementType: 'ADJUSTMENT' as const, quantityChange: -3, referenceId: 'ADJ-AUDIT-001' },
  ];

  await prisma.inventoryLedger.createMany({ data: ledgerEntries });
  console.log(`  ✔ ${ledgerEntries.length} ledger entries`);

  console.log('\n✅ Seed complete!\n');
  console.log('─────────────────────────────────────────');
  console.log('  Login credentials:');
  console.log('  Manager → manager@coreinventory.io / manager123');
  console.log('  Staff   → staff@coreinventory.io   / staff123');
  console.log('─────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
