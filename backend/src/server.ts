import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import { loadData } from './db/database.js';
import { connectMongoDB } from './db/mongoose.js';

import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import securityRoutes from './routes/security.routes.js';
import crmRoutes from './routes/crm.routes.js';
import propertiesRoutes from './routes/properties.routes.js';
import salesRoutes from './routes/sales.routes.js';
import commissionsRoutes from './routes/commissions.routes.js';
import matchingRoutes from './routes/matching.routes.js';
import leadRoutes from './routes/lead.routes.js';
import publicRoutes from './routes/public.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Storage (Local file + MongoDB fallback)
loadData();
connectMongoDB().then(async (connected) => {
  if (connected) {
    await loadData();
    console.log('✅ In-memory store synced with MongoDB Atlas on startup');
  }
});

app.use(cors({
  origin: '*',
  credentials: true
}));
// Anti-Cache Headers: Ensure no device or proxy caches API responses
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health Check
app.get(['/api/v1/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Swaramayi Real Estate CRM & Unified Backend API',
    version: '1.0.0',
    company: 'SWARNAMAYI REAL ESTATE MARKETING',
    mongodb_uri: process.env.MONGODB_URI,
    timestamp: new Date().toISOString()
  });
});

// Authenticated CRM API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/security', securityRoutes);
app.use('/api/v1/crm', crmRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/properties', propertiesRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/commissions', commissionsRoutes);
app.use('/api/v1/matching', matchingRoutes);

// Public Website API Routes (accessible without auth)
app.use('/api/v1/public', publicRoutes);
app.use('/api/public', publicRoutes);
app.use('/api', publicRoutes); // Direct `/api/properties`, `/api/projects`, `/api/enquiries`, `/api/site-visits` fallback for website frontend

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    status: 'ERROR',
    error_code: 'SERVER_ERROR',
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Swaramayi Real Estate Unified Backend running on port ${PORT}`);
  console.log(`📍 Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`🌐 Public Website API: http://localhost:${PORT}/api/v1/public`);
  console.log(`====================================================`);
});

export default app;
