import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shree_shakti_billing',
  sessionSecret: process.env.SESSION_SECRET || 'shree_shakti_super_secret_session_key',
  sessionMaxAgeDays: parseInt(process.env.SESSION_MAX_AGE_DAYS || '7', 10),
  hirenInitialPassword: process.env.HIREN_INITIAL_PASSWORD || '3112',
  sureshInitialPassword: process.env.SURESH_INITIAL_PASSWORD || '1975',
  pdfStorageDir: path.resolve(process.env.PDF_STORAGE_DIR || './storage/pdfs'),
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Shree Shakti Electric <noreply@shreeshaktielectric.com>',
  },
};
