# CoreInventory Frontend

Next.js 14 frontend for the CoreInventory Inventory Management System.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

> The backend must be running on `http://localhost:3000`

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Demo Credentials

| Role    | Email                      | Password   |
|---------|----------------------------|------------|
| Manager | manager@coreinventory.io   | manager123 |
| Staff   | staff@coreinventory.io     | staff123   |

## Pages

| Route          | Description                        |
|----------------|------------------------------------|
| /login         | Authentication                     |
| /dashboard     | KPIs, charts, activity, alerts     |
| /products      | Product catalog with search/filter |
| /products/create | Create or edit products           |
| /receipts      | Incoming goods — validate to +stock|
| /deliveries    | Outgoing orders — validate to -stock|
| /transfers     | Internal location moves            |
| /adjustments   | Physical count reconciliation      |
| /ledger        | Full audit trail                   |

## Tech Stack

- **Next.js 14** — App Router
- **TanStack Query** — server state, caching, invalidation
- **React Hook Form + Zod** — form validation
- **Recharts** — dashboard charts
- **Tailwind CSS** — dark industrial theme
- **IBM Plex Sans + Syne** — typography
