import { Router } from 'express';
import authRoutes from './authRoutes.js';
import customerRoutes from './customerRoutes.js';
import productRoutes from './productRoutes.js';
import invoiceRoutes from './invoiceRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import reportRoutes from './reportRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import auditRoutes from './auditRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/customers', customerRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/invoices', invoiceRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/audit-logs', auditRoutes);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Shree Shakti Billing API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default apiRouter;
