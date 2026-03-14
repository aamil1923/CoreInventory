# CoreInventory Backend

Production-ready REST API for the CoreInventory Inventory Management System.

Built with **Node.js + Express + PostgreSQL + Prisma + TypeScript**.

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Run database migration
```bash
npx prisma migrate dev --schema=src/prisma/schema.prisma --name init
```

### 4. Generate Prisma client
```bash
npm run prisma:generate
```

### 5. Seed sample data
```bash
npm run seed
```

### 6. Start development server
```bash
npm run dev
```

Server runs at: `http://localhost:3000`

---

## Default Credentials (after seed)

| Role    | Email                        | Password     |
|---------|------------------------------|--------------|
| Manager | manager@coreinventory.io     | manager123   |
| Staff   | staff@coreinventory.io       | staff123     |

---

## Environment Variables

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/coreinventory?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
OTP_EXPIRY_MINUTES=15
CORS_ORIGIN="http://localhost:5173"
```

---

## API Reference

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

All routes except `/auth/*` require:
```
Authorization: Bearer <token>
```

---

### Auth

| Method | Endpoint              | Description        | Auth |
|--------|-----------------------|--------------------|------|
| POST   | /auth/signup          | Register user      | No   |
| POST   | /auth/login           | Login              | No   |
| POST   | /auth/request-reset   | Request OTP        | No   |
| POST   | /auth/verify-otp      | Reset password     | No   |

**POST /auth/signup**
```json
{
  "name": "Alex Chen",
  "email": "alex@example.com",
  "password": "securepassword",
  "role": "MANAGER"
}
```

**POST /auth/login**
```json
{
  "email": "alex@example.com",
  "password": "securepassword"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": { "id": "...", "name": "Alex Chen", "email": "...", "role": "MANAGER" }
  }
}
```

---

### Products

| Method | Endpoint                  | Description           | Role     |
|--------|---------------------------|-----------------------|----------|
| GET    | /products                 | List (with filters)   | Any      |
| POST   | /products                 | Create                | MANAGER  |
| GET    | /products/:id             | Get with stock levels | Any      |
| PUT    | /products/:id             | Update                | MANAGER  |
| DELETE | /products/:id             | Delete                | MANAGER  |
| GET    | /products/meta/categories | List categories       | Any      |
| POST   | /products/meta/categories | Create category       | MANAGER  |

**Query params for GET /products:**
- `search` — search by name or SKU
- `categoryId` — filter by category UUID
- `warehouseId` — filter by warehouse
- `page`, `limit` — pagination

**POST /products**
```json
{
  "name": "Steel Rods 10mm",
  "sku": "SR-010",
  "categoryId": "<uuid>",
  "unitOfMeasure": "pcs",
  "reorderLevel": 50
}
```

---

### Warehouses & Locations

| Method | Endpoint                   | Description        | Role    |
|--------|----------------------------|--------------------|---------|
| GET    | /warehouses                | List all           | Any     |
| POST   | /warehouses                | Create             | MANAGER |
| GET    | /warehouses/:id            | Get with locations | Any     |
| PATCH  | /warehouses/:id            | Update             | MANAGER |
| GET    | /warehouses/meta/locations | List locations     | Any     |
| POST   | /warehouses/meta/locations | Create location    | MANAGER |

---

### Receipts

| Method | Endpoint               | Description           | Role    |
|--------|------------------------|-----------------------|---------|
| GET    | /receipts              | List (filter: status) | Any     |
| POST   | /receipts              | Create                | Any     |
| GET    | /receipts/:id          | Get detail            | Any     |
| PATCH  | /receipts/:id/status   | Update status         | Any     |
| POST   | /receipts/:id/validate | Validate → stock +    | MANAGER |

**POST /receipts**
```json
{
  "supplier": "MetalCorp Ltd",
  "notes": "Monthly order",
  "status": "DRAFT",
  "items": [
    { "productId": "<uuid>", "locationId": "<uuid>", "quantity": 100 }
  ]
}
```

---

### Deliveries

| Method | Endpoint                 | Description           | Role    |
|--------|--------------------------|-----------------------|---------|
| GET    | /deliveries              | List (filter: status) | Any     |
| POST   | /deliveries              | Create                | Any     |
| GET    | /deliveries/:id          | Get detail            | Any     |
| PATCH  | /deliveries/:id/status   | Update status         | Any     |
| POST   | /deliveries/:id/validate | Validate → stock -    | MANAGER |

**POST /deliveries**
```json
{
  "customer": "Acme Corp",
  "items": [
    { "productId": "<uuid>", "locationId": "<uuid>", "quantity": 50 }
  ]
}
```

---

### Transfers

| Method | Endpoint                 | Description           | Role    |
|--------|--------------------------|-----------------------|---------|
| GET    | /transfers               | List (filter: status) | Any     |
| POST   | /transfers               | Create                | Any     |
| GET    | /transfers/:id           | Get detail            | Any     |
| POST   | /transfers/:id/complete  | Complete transfer     | MANAGER |

**POST /transfers**
```json
{
  "notes": "Move to production floor",
  "items": [
    {
      "productId": "<uuid>",
      "quantity": 10,
      "sourceLocationId": "<uuid>",
      "destinationLocationId": "<uuid>"
    }
  ]
}
```

---

### Adjustments

| Method | Endpoint       | Description    | Role    |
|--------|----------------|----------------|---------|
| GET    | /adjustments   | List           | Any     |
| POST   | /adjustments   | Record         | MANAGER |

**POST /adjustments**
```json
{
  "productId": "<uuid>",
  "locationId": "<uuid>",
  "physicalCount": 97,
  "reason": "Damaged goods found during cycle count"
}
```

---

### Dashboard

| Method | Endpoint            | Description          | Auth |
|--------|---------------------|----------------------|------|
| GET    | /dashboard/kpis     | KPI summary          | Yes  |
| GET    | /dashboard/activity | Recent activity      | Yes  |
| GET    | /dashboard/alerts   | Low/out of stock     | Yes  |

**GET /dashboard/kpis response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 8,
    "lowStockItems": 3,
    "outOfStockItems": 1,
    "pendingReceipts": 2,
    "pendingDeliveries": 2,
    "pendingTransfers": 1
  }
}
```

---

### Ledger

| Method | Endpoint  | Description          | Auth |
|--------|-----------|----------------------|------|
| GET    | /ledger   | Movement history     | Yes  |

**Query params:**
- `productId` — filter by product
- `locationId` — filter by location
- `movementType` — RECEIPT | DELIVERY | TRANSFER | ADJUSTMENT
- `page`, `limit`

---

## Business Rules

1. **Stock only updates on validation/completion** — draft and waiting records have no stock impact
2. **Transfers create two ledger entries** — one debit from source, one credit to destination
3. **Stock cannot go negative** — deliveries and source-side transfers are blocked if insufficient stock
4. **Every operation creates a ledger entry** — full audit trail guaranteed
5. **All inventory operations use database transactions** — ACID consistency enforced

---

## Project Structure

```
src/
├── config/
│   └── database.ts          # Prisma client singleton
├── controllers/
│   ├── authController.ts
│   ├── productController.ts
│   ├── receiptController.ts
│   ├── deliveryController.ts
│   ├── transferController.ts
│   ├── adjustmentController.ts
│   ├── dashboardController.ts
│   ├── ledgerController.ts
│   └── warehouseController.ts
├── routes/
│   └── *.ts                 # Express routers
├── services/
│   ├── inventoryService.ts  # Validates operations, orchestrates stock + ledger
│   ├── ledgerService.ts     # Ledger CRUD
│   └── stockService.ts      # Stock level CRUD + queries
├── middleware/
│   ├── authMiddleware.ts    # JWT verification + role guard
│   └── errorMiddleware.ts   # Global error handler
├── utils/
│   ├── jwt.ts
│   └── otp.ts
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Sample data
├── app.ts                   # Express app
└── server.ts                # Entry point
```

---

## Available Scripts

```bash
npm run dev           # Start with hot reload (ts-node-dev)
npm run build         # Compile TypeScript
npm run start         # Run compiled JS
npm run prisma:generate   # Regenerate Prisma client
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open Prisma Studio GUI
npm run seed          # Seed sample data
```
