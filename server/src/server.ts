import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config/index.js';
import { connectDB } from './config/database.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { logger } from './utils/logger.js';

const app = express();

// Trust proxy for LAN/reverse-proxy setups
app.set('trust proxy', 1);

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // allow flexible PDF preview & inline SVGs
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS setup
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or local tools)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.startsWith('http://192.168.') || origin.startsWith('http://10.')) {
        return callback(null, true);
      }
      callback(null, true); // Permissive in dev/LAN for second manager computer
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiting
app.use('/api', apiLimiter);

// Session Management with MongoStore
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.mongoUri,
      collectionName: 'sessions',
      ttl: config.sessionMaxAgeDays * 24 * 60 * 60,
      autoRemove: 'native',
    }),
    cookie: {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: config.env === 'production' ? 'none' : 'lax',
      maxAge: config.sessionMaxAgeDays * 24 * 60 * 60 * 1000,
    },
  })
);

// Serve static assets (signatures, logo, uploads)
app.use('/assets', express.static(path.resolve(process.cwd(), 'src/assets')));
app.use('/storage/pdfs', express.static(config.pdfStorageDir));

// API Routes
app.use('/api/v1', apiRouter);

// Root fallback
app.get('/', (req, res) => {
  res.json({
    message: 'SHREE SHAKTI BILLING REST API is online.',
    version: '1.0.0',
    documentation: '/api/v1/health',
  });
});

// Centralized Error Handling
app.use(errorHandler);

// Start Server
async function startServer() {
  try {
    await connectDB();

    app.listen(config.port, '0.0.0.0', () => {
      logger.info(`⚡ Server running on http://0.0.0.0:${config.port}`);
      logger.info(`⚡ API available at http://localhost:${config.port}/api/v1`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Fatal error during server startup');
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
