import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import receiptRoutes from './routes/receiptRoutes';
import deliveryRoutes from './routes/deliveryRoutes';
import transferRoutes from './routes/transferRoutes';
import adjustmentRoutes from './routes/adjustmentRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import ledgerRoutes from './routes/ledgerRoutes';
import warehouseRoutes from './routes/warehouseRoutes';

import { errorHandler, notFound } from './middleware/errorMiddleware';

const app = express();

// Security & logging
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'CoreInventory API', timestamp: new Date().toISOString() });
});

// API routes
const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/products`, productRoutes);
app.use(`${API}/receipts`, receiptRoutes);
app.use(`${API}/deliveries`, deliveryRoutes);
app.use(`${API}/transfers`, transferRoutes);
app.use(`${API}/adjustments`, adjustmentRoutes);
app.use(`${API}/dashboard`, dashboardRoutes);
app.use(`${API}/ledger`, ledgerRoutes);
app.use(`${API}/warehouses`, warehouseRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
