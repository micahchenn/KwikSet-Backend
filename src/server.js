import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import paymentRoutes from './routes/paymentRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import accessCodeRoutes from './routes/accessCodeRoutes.js';
import connectRoutes from './routes/connectRoutes.js';
import crappieHouseRoutes from './routes/crappieHouseRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/access-codes', accessCodeRoutes);
app.use('/api/connect', connectRoutes);
app.use('/api/crappie-house', crappieHouseRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint - serve UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Crappie House checkout page
app.get('/crappie-house', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/crappie-house.html'));
});

// Admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Gate simulation page
app.get('/gate', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/gate.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Web UI: http://localhost:${PORT}/`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API: http://localhost:${PORT}/api`);
});

export default app;

